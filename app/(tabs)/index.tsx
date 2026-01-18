import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  ListRenderItem,
  Modal,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import api, { API_BASE } from "../../services/api";

const { width: screenWidth } = Dimensions.get('window');

// Type definitions
interface Restaurant {
  id: string;
  name: string;
  rating: number;
  image: string;
  category: string;
}

interface FoodItem {
  id: number;
  name: string;
  price: number;
  rating?: number;
  imageUrl: string;
  category: string;
  categoryId?: string;
  description?: string;
  available: boolean;
  stockQuantity: number;
}

interface Category {
  id: string;
  name: string;
}

interface PriceRange {
  min: number;
  max: number;
}

// Props interface cho RestaurantCard
interface RestaurantCardProps {
  item: Restaurant;
  isActive: boolean;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ item, isActive }) => {
  return (
    <TouchableOpacity style={[styles.restaurantCard, isActive && styles.activeRestaurantCard]}>
      <Image source={{ uri: item.image }} style={styles.restaurantImage} />
      <View style={styles.restaurantInfo}>
        <Text style={styles.restaurantName}>{item.name}</Text>
        <Text style={styles.restaurantCategory}>{item.category}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FF6B35" />
          <Text style={styles.rating}> {item.rating}</Text>
          <Text style={styles.ratingText}> ({item.rating > 4.5 ? 'Excellent' : 'Good'})</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const [activeRestaurantIndex, setActiveRestaurantIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [filteredFoodItems, setFilteredFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const flatListRef = useRef<FlatList<Restaurant>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // State cho bộ lọc giá
  const [priceRange, setPriceRange] = useState<PriceRange>({ min: 0, max: 1000000 });
  const [tempPriceRange, setTempPriceRange] = useState<PriceRange>({ min: 0, max: 1000000 });
  const [isFilterActive, setIsFilterActive] = useState<boolean>(false);

  // Dữ liệu mẫu cho restaurants
  const popularRestaurants: Restaurant[] = [
    {
      id: '1',
      name: 'Restaurant 1',
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=400&fit=crop',
      category: 'Nhà hàng',
    },
    {
      id: '2',
      name: 'Restaurant 2',
      rating: 4.0,
      image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400&h=400&fit=crop',
      category: 'Quán ăn',
    },
    {
      id: '3',
      name: 'Restaurant 3',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=400&fit=crop',
      category: 'Cafe',
    },
  ];

  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Fetch products từ API
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/api/customer/categories");
      const all = { id: "all", name: "Tất cả" };
      const normalized = res.data.map((c: any) => ({
        id: c.id.toString(),
        name: c.name,
      }));
      setCategories([all, ...normalized]);
    } catch (err) {
      console.log("❌ Category load error:", err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setLoadingError(null);
      console.log("🔌 Fetching products...");

      const res = await api.get("/api/customer/products");
      const data = res.data;

      const transformedItems: FoodItem[] = data.map((product: any) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        rating: 4.5,
        imageUrl: product.imageUrl
          ? `${API_BASE}${product.imageUrl}`
          : "https://source.unsplash.com/random/400x300/?food",
        category: product.category?.name || "Food",
        categoryId: product.category?.id?.toString(),
        description: product.description || "",
        available: product.stockQuantity > 0,
        stockQuantity: product.stockQuantity,
      }));

      setFoodItems(transformedItems);

      // Tự động tính toán khoảng giá từ dữ liệu
      const prices = transformedItems.map(item => item.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      setPriceRange({ min: minPrice, max: maxPrice });
      setTempPriceRange({ min: minPrice, max: maxPrice });

      // Áp dụng filter ngay sau khi load dữ liệu
      applyFilters(transformedItems, "", "all", { min: minPrice, max: maxPrice });
    } catch (err: any) {
      console.error("❌ Product load failed:", err?.response?.status, err?.message);
      setLoadingError("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
  };

  // Tự động lướt Popular Restaurants
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveRestaurantIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % popularRestaurants.length;
        if (flatListRef.current) {
          flatListRef.current.scrollToIndex({
            index: nextIndex,
            animated: true,
            viewPosition: 0.5,
          });
        }
        return nextIndex;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Hàm áp dụng tất cả bộ lọc
  const applyFilters = (
    data: FoodItem[],
    query: string,
    category: string,
    price: PriceRange
  ) => {
    let filtered = [...data];

    // Filter by category
    if (category !== "all") {
      filtered = filtered.filter(item => item.categoryId === category);
    }

    // Filter by search
    if (query.trim() !== "") {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Filter by price range
    filtered = filtered.filter(item =>
      item.price >= price.min && item.price <= price.max
    );

    // Kiểm tra xem có filter đang active không
    const hasActiveFilters = category !== "all" || query.trim() !== "" ||
      (price.min !== tempPriceRange.min || price.max !== tempPriceRange.max);
    setIsFilterActive(hasActiveFilters);

    setFilteredFoodItems(filtered);
  };

  // Effect để áp dụng filters khi có thay đổi
  useEffect(() => {
    applyFilters(foodItems, searchQuery, activeCategory, priceRange);
  }, [searchQuery, foodItems, activeCategory, priceRange]);

  // Mở modal filter
  const openFilterModal = () => {
    setTempPriceRange(priceRange);
    setShowFilterModal(true);
  };

  // Áp dụng filter từ modal
  const applyFilterFromModal = () => {
    setPriceRange(tempPriceRange);
    setShowFilterModal(false);
  };

  // Reset filter
  const resetFilter = () => {
    const minPrice = Math.min(...foodItems.map(item => item.price));
    const maxPrice = Math.max(...foodItems.map(item => item.price));
    setPriceRange({ min: minPrice, max: maxPrice });
    setTempPriceRange({ min: minPrice, max: maxPrice });
    setIsFilterActive(false);
  };

  // Format price to Vietnamese Dong
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Hàm xử lý thay đổi giá trị slider
  const handleSliderChange = (values: number | number[]) => {
    if (Array.isArray(values)) {
      setTempPriceRange({ min: values[0], max: values[1] });
    }
  };

  // Tạo hàm handleFoodPress
  const handleFoodPress = (item: FoodItem) => {
    if (!item.available) {
      alert('Sản phẩm này hiện không có sẵn');
      return;
    }

    const orderItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      rating: item.rating || 4.0,
      image: item.imageUrl,
      category: item.category,
      description: item.description,
      available: item.available,
    };

    router.push({
      pathname: '/order',
      params: {
        item: JSON.stringify(orderItem)
      }
    });
  };

  // Render chỉ báo (dots) cho Popular Restaurants
  const renderPagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {popularRestaurants.map((_, index) => {
          const inputRange = [
            (index - 1) * (screenWidth * 0.8 + 12),
            index * (screenWidth * 0.8 + 12),
            (index + 1) * (screenWidth * 0.8 + 12),
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 16, 8],
            extrapolate: 'clamp',
          });

          const dotOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.paginationDot,
                {
                  width: dotWidth,
                  opacity: dotOpacity,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  // Render item cho FlatList
  const renderRestaurantItem: ListRenderItem<Restaurant> = ({ item, index }) => (
    <View style={styles.restaurantCardWrapper}>
      <RestaurantCard
        item={item}
        isActive={index === activeRestaurantIndex}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF6B35']}
            tintColor="#FF6B35"
          />
        }
      >
        {/* Header với Search và Location */}
        <View style={styles.header}>
          {/* Top Bar với Search */}
          <View style={styles.topBar}>
            <View style={styles.searchContainer}>
              <Feather name="search" size={20} color="#636E72" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm món ăn, nhà hàng..."
                placeholderTextColor="#95A5A6"
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.clearButton}
                >
                  <Feather name="x" size={16} color="#636E72" />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color="#2D3436" />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>3</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Welcome */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Xin chào, Thực khách!</Text>
            <Text style={styles.welcomeSubtitle}>Hôm nay bạn muốn ăn gì?</Text>
          </View>
        </View>

        {/* Popular Restaurants với Auto Scroll */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nhà hàng nổi bật</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.carouselContainer}>
            <Animated.FlatList
              ref={flatListRef}
              data={popularRestaurants}
              keyExtractor={(item: Restaurant) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              snapToInterval={screenWidth * 0.8 + 12}
              decelerationRate="fast"
              contentContainerStyle={styles.carouselContent}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: false }
              )}
              scrollEventThrottle={16}
              renderItem={renderRestaurantItem}
            />
            {renderPagination()}
          </View>
        </View>

        {/* Food Categories và Filter Button */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Danh mục món ăn</Text>

            <View style={styles.filterButtonContainer}>
              {isFilterActive && (
                <TouchableOpacity
                  style={styles.resetFilterButton}
                  onPress={resetFilter}
                >
                  <Feather name="x" size={16} color="#FF6B35" />
                  <Text style={styles.resetFilterText}>Xóa lọc</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.filterButton, isFilterActive && styles.filterButtonActive]}
                onPress={openFilterModal}
              >
                <Ionicons
                  name="filter"
                  size={20}
                  color={isFilterActive ? "#FFFFFF" : "#FF6B35"}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Category Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryTabs}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryTab,
                  activeCategory === category.id && styles.activeCategoryTab,
                ]}
                onPress={() => setActiveCategory(category.id)}>
                <Text
                  style={[
                    styles.categoryText,
                    activeCategory === category.id && styles.activeCategoryText,
                  ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Hiển thị filter active */}
          {isFilterActive && (
            <View style={styles.activeFilterContainer}>
              <Text style={styles.activeFilterText}>
                Giá: {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
              </Text>
            </View>
          )}

          {/* Kết quả tìm kiếm và lọc */}
          {searchQuery.length > 0 && (
            <Text style={styles.searchResultText}>
              Tìm thấy {filteredFoodItems.length} kết quả
            </Text>
          )}

          {loadingError && (
            <Text style={styles.errorText}>{loadingError}</Text>
          )}

          {/* Loading State */}
          {loading && !refreshing && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF6B35" />
              <Text style={styles.loadingText}>Đang tải món ăn...</Text>
            </View>
          )}

          {/* Food Items Grid */}
          {!loading && (
            <View style={styles.foodGrid}>
              {filteredFoodItems.length > 0 ? (
                filteredFoodItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.foodCard, !item.available && styles.unavailableCard]}
                    onPress={() => handleFoodPress(item)}
                    disabled={!item.available}
                  >
                    {!item.available && (
                      <View style={styles.unavailableOverlay}>
                        <Text style={styles.unavailableText}>Hết hàng</Text>
                      </View>
                    )}
                    <View style={styles.foodImageContainer}>
                      <Image
                        source={{ uri: item.imageUrl }}
                        style={styles.foodImage}
                        onError={() => {
                          console.log('Image load error for:', item.imageUrl);
                        }}
                      />
                      <TouchableOpacity style={styles.favoriteButton}>
                        <Ionicons name="heart" size={18} color="#FF6B35" />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.foodInfo}>
                      <Text style={styles.foodName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.foodCategory}>{item.category}</Text>
                      <View style={styles.foodBottom}>
                        <Text style={styles.foodPrice}>{formatPrice(item.price)}</Text>
                        {item.rating && (
                          <View style={styles.foodRating}>
                            <Ionicons name="star" size={14} color="#FF6B35" />
                            <Text style={styles.ratingNumber}>{item.rating.toFixed(1)}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              ) : searchQuery.length > 0 ? (
                <View style={styles.noResultsContainer}>
                  <Feather name="search" size={48} color="#E9ECEF" />
                  <Text style={styles.noResultsText}>Không tìm thấy món ăn</Text>
                  <Text style={styles.noResultsSubtext}>Thử từ khóa tìm kiếm khác</Text>
                </View>
              ) : (
                <View style={styles.noResultsContainer}>
                  <Ionicons name="fast-food-outline" size={48} color="#E9ECEF" />
                  <Text style={styles.noResultsText}>Chưa có món ăn nào</Text>
                  <Text style={styles.noResultsSubtext}>Vui lòng thử lại sau</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal lọc giá với TextInput */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lọc theo giá</Text>
              <TouchableOpacity
                onPress={() => setShowFilterModal(false)}
                style={styles.closeButton}
              >
                <Feather name="x" size={24} color="#2D3436" />
              </TouchableOpacity>
            </View>

            <View style={styles.priceRangeContainer}>
              <Text style={styles.modalSubtitle}>Nhập khoảng giá (VND)</Text>

              <View style={styles.priceInputContainer}>
                <View style={styles.priceInputGroup}>
                  <Text style={styles.priceInputLabel}>Giá thấp nhất:</Text>
                  <View style={styles.priceInputWrapper}>
                    <TextInput
                      style={styles.priceInput}
                      value={tempPriceRange.min.toString()}
                      onChangeText={(text) => {
                        const value = parseInt(text) || 0;
                        setTempPriceRange(prev => ({
                          ...prev,
                          min: Math.min(value, tempPriceRange.max)
                        }));
                      }}
                      keyboardType="numeric"
                      placeholder="0"
                    />
                    <Text style={styles.currencyText}>đ</Text>
                  </View>
                </View>

                <View style={styles.priceInputGroup}>
                  <Text style={styles.priceInputLabel}>Giá cao nhất:</Text>
                  <View style={styles.priceInputWrapper}>
                    <TextInput
                      style={styles.priceInput}
                      value={tempPriceRange.max.toString()}
                      onChangeText={(text) => {
                        const value = parseInt(text) || 0;
                        setTempPriceRange(prev => ({
                          ...prev,
                          max: Math.max(value, tempPriceRange.min)
                        }));
                      }}
                      keyboardType="numeric"
                      placeholder="1000000"
                    />
                    <Text style={styles.currencyText}>đ</Text>
                  </View>
                </View>
              </View>

              <View style={styles.pricePresets}>
                <Text style={styles.presetsTitle}>Lựa chọn nhanh:</Text>
                <View style={styles.presetButtons}>
                  <TouchableOpacity
                    style={styles.presetButton}
                    onPress={() => {
                      const min = Math.min(...foodItems.map(item => item.price));
                      const max = Math.max(...foodItems.map(item => item.price));
                      setTempPriceRange({ min, max });
                    }}
                  >
                    <Text style={styles.presetButtonText}>Tất cả</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.presetButton}
                    onPress={() => {
                      const max = Math.max(...foodItems.map(item => item.price));
                      setTempPriceRange({ min: 0, max: 50000 });
                    }}
                  >
                    <Text style={styles.presetButtonText}>Dưới 50k</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.presetButton}
                    onPress={() => {
                      setTempPriceRange({ min: 50000, max: 100000 });
                    }}
                  >
                    <Text style={styles.presetButtonText}>50k - 100k</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.presetButton}
                    onPress={() => {
                      setTempPriceRange({ min: 100000, max: 200000 });
                    }}
                  >
                    <Text style={styles.presetButtonText}>100k - 200k</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.applyButton}
                onPress={applyFilterFromModal}
              >
                <Text style={styles.applyButtonText}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#2D3436',
    paddingVertical: 0,
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E9ECEF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF6B35',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  welcomeContainer: {
    marginBottom: 10,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#636E72',
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  seeAllText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  filterButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6B35',
    marginLeft: 10,
  },
  filterButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  resetFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF2E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  resetFilterText: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '500',
    marginLeft: 4,
  },
  activeFilterContainer: {
    backgroundColor: '#FFF2E8',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  activeFilterText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '500',
  },
  searchResultText: {
    fontSize: 12,
    color: '#95A5A6',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  carouselContainer: {
    marginBottom: 20,
  },
  carouselContent: {
    paddingHorizontal: 8,
  },
  restaurantCardWrapper: {
    width: screenWidth * 0.8,
    marginHorizontal: 6,
  },
  restaurantCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  activeRestaurantCard: {
    shadowColor: '#FF6B35',
    shadowOpacity: 0.2,
    elevation: 5,
  },
  restaurantImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginBottom: 12,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 4,
  },
  restaurantCategory: {
    fontSize: 14,
    color: '#636E72',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: 'bold',
    marginLeft: 4,
    marginRight: 8,
  },
  ratingText: {
    fontSize: 12,
    color: '#636E72',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B35',
    marginHorizontal: 4,
  },
  categoryTabs: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  categoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#F5F5F5',
  },
  activeCategoryTab: {
    backgroundColor: '#FF6B35',
  },
  categoryText: {
    fontSize: 14,
    color: '#636E72',
    fontWeight: '500',
  },
  activeCategoryText: {
    color: '#fff',
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#636E72',
  },
  foodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  foodCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  unavailableCard: {
    opacity: 0.7,
  },
  unavailableOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  unavailableText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  foodImageContainer: {
    position: 'relative',
  },
  foodImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginBottom: 12,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 4,
  },
  foodCategory: {
    fontSize: 12,
    color: '#636E72',
    marginBottom: 8,
  },
  foodBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  foodRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingNumber: {
    fontSize: 14,
    color: '#636E72',
    fontWeight: '600',
    marginLeft: 4,
  },
  noResultsContainer: {
    width: '100%',
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3436',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#95A5A6',
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceRangeContainer: {
    marginBottom: 32,
  },
  priceRangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  priceRangeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
  },
  sliderContainer: {
    paddingHorizontal: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#636E72',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Thêm vào StyleSheet
  modalSubtitle: {
    fontSize: 16,
    color: '#636E72',
    marginBottom: 20,
  },
  priceInputContainer: {
    marginBottom: 24,
  },
  priceInputGroup: {
    marginBottom: 16,
  },
  priceInputLabel: {
    fontSize: 14,
    color: '#636E72',
    marginBottom: 8,
  },
  priceInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  priceInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#2D3436',
  },
  currencyText: {
    fontSize: 14,
    color: '#636E72',
    marginLeft: 8,
  },
  pricePresets: {
    marginBottom: 24,
  },
  presetsTitle: {
    fontSize: 14,
    color: '#636E72',
    marginBottom: 12,
  },
  presetButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  presetButtonText: {
    fontSize: 14,
    color: '#636E72',
  },
});
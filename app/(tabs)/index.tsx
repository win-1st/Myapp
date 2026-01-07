import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  ListRenderItem,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

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
  id: string;
  name: string;
  price: string;
  rating: number;
  image: string;
  category: string;
}

interface Category {
  id: string;
  name: string;
  active: boolean;
}

// Dữ liệu mẫu
const popularRestaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Cherry Healthy',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=400&fit=crop',
    category: 'Healthy Food',
  },
  {
    id: '2',
    name: 'Burger Tamo',
    rating: 4.0,
    image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400&h=400&fit=crop',
    category: 'Fast Food',
  },
  {
    id: '3',
    name: 'Sushi Master',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=400&fit=crop',
    category: 'Japanese',
  },
  {
    id: '4',
    name: 'Pizza Palace',
    rating: 4.3,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop',
    category: 'Italian',
  },
  {
    id: '5',
    name: 'Seafood Harbor',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=400&fit=crop',
    category: 'Seafood',
  },
];

const foodItems: FoodItem[] = [
  {
    id: '1',
    name: 'Soup Bumil',
    price: 'IDR 289,000',
    rating: 4.1,
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop',
    category: 'Soup',
  },
  {
    id: '2',
    name: 'Grilled Chicken',
    price: 'IDR 4,509,000',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&h=300&fit=crop',
    category: 'Chicken',
  },
  {
    id: '3',
    name: 'Spicy Shrimp',
    price: 'IDR 999,000',
    rating: 3.2,
    image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop',
    category: 'Seafood',
  },
  {
    id: '4',
    name: 'Beef Steak',
    price: 'IDR 1,250,000',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&h=300&fit=crop',
    category: 'Beef',
  },
  {
    id: '5',
    name: 'Veggie Salad',
    price: 'IDR 189,000',
    rating: 4.3,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop',
    category: 'Salad',
  },
  {
    id: '6',
    name: 'Pasta Carbonara',
    price: 'IDR 450,000',
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1598866594230-a7c12756260f?w=400&h=300&fit=crop',
    category: 'Pasta',
  },
];

const categories: Category[] = [
  { id: '1', name: 'New Taste', active: true },
  { id: '2', name: 'Popular', active: false },
  { id: '3', name: 'Recommended', active: false },
];

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
  const [activeCategory, setActiveCategory] = useState<string>('1');
  const [activeRestaurantIndex, setActiveRestaurantIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const flatListRef = useRef<FlatList<Restaurant>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Tự động lướt Popular Restaurants
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveRestaurantIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % popularRestaurants.length;

        // Cuộn đến item tiếp theo
        if (flatListRef.current) {
          flatListRef.current.scrollToIndex({
            index: nextIndex,
            animated: true,
            viewPosition: 0.5,
          });
        }

        return nextIndex;
      });
    }, 3000); // Lướt sau mỗi 3 giây

    return () => clearInterval(interval);
  }, []);

  // Filter food items based on search query
  const filteredFoodItems = foodItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  // Xử lý tìm kiếm
  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header với Search và Location */}
        <View style={styles.header}>
          {/* Top Bar với Search */}
          <View style={styles.topBar}>
            <View style={styles.searchContainer}>
              <Feather name="search" size={20} color="#636E72" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search food, restaurants..."
                placeholderTextColor="#95A5A6"
                value={searchQuery}
                onChangeText={handleSearch}
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

          {/* Location và Welcome */}
          <View style={styles.welcomeContainer}>
            <View style={styles.locationContainer}>
              <MaterialIcons name="location-on" size={18} color="#FF6B35" />
              <Text style={styles.locationText}>Jakarta, Indonesia</Text>
            </View>
            <Text style={styles.welcomeTitle}>Hi, Food Lover!</Text>
            <Text style={styles.welcomeSubtitle}>What would you like to eat today?</Text>
          </View>
        </View>

        {/* Popular Restaurants với Auto Scroll */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Restaurants</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
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

        {/* Food Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Food Categories</Text>
            {searchQuery.length > 0 && (
              <Text style={styles.searchResultText}>
                {filteredFoodItems.length} results found
              </Text>
            )}
          </View>

          <View style={styles.categoryTabs}>
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
          </View>

          {/* Food Items Grid */}
          <View style={styles.foodGrid}>
            {filteredFoodItems.length > 0 ? (
              filteredFoodItems.map((item) => (
                <TouchableOpacity key={item.id} style={styles.foodCard}>
                  <View style={styles.foodImageContainer}>
                    <Image source={{ uri: item.image }} style={styles.foodImage} />
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
                      <Text style={styles.foodPrice}>{item.price}</Text>
                      <View style={styles.foodRating}>
                        <Ionicons name="star" size={14} color="#FF6B35" />
                        <Text style={styles.ratingNumber}>{item.rating}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : searchQuery.length > 0 ? (
              <View style={styles.noResultsContainer}>
                <Feather name="search" size={48} color="#E9ECEF" />
                <Text style={styles.noResultsText}>No food items found</Text>
                <Text style={styles.noResultsSubtext}>Try a different search term</Text>
              </View>
            ) : (
              foodItems.map((item) => (
                <TouchableOpacity key={item.id} style={styles.foodCard}>
                  <View style={styles.foodImageContainer}>
                    <Image source={{ uri: item.image }} style={styles.foodImage} />
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
                      <Text style={styles.foodPrice}>{item.price}</Text>
                      <View style={styles.foodRating}>
                        <Ionicons name="star" size={14} color="#FF6B35" />
                        <Text style={styles.ratingNumber}>{item.rating}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </ScrollView>
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
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#636E72',
    marginLeft: 6,
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
  searchResultText: {
    fontSize: 12,
    color: '#95A5A6',
    fontStyle: 'italic',
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
    marginBottom: 20,
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
});
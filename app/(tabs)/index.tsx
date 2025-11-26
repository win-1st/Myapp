import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Image,
  TouchableOpacity,
} from 'react-native';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>FoodMarket</Text>
          <Text style={styles.subtitle}>Let is get some foods</Text>
        </View>

        {/* Popular Restaurants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Restaurants</Text>

          {/* Restaurant 1 */}
          <TouchableOpacity style={styles.restaurantCard}>
            <Image
              source={{ uri: 'https://via.placeholder.com/80x80' }}
              style={styles.restaurantImage}
            />
            <View style={styles.restaurantInfo}>
              <Text style={styles.restaurantName}>Cherry Healthy</Text>
              <Text style={styles.rating}>★★★★ 4.5</Text>
            </View>
          </TouchableOpacity>

          {/* Restaurant 2 */}
          <TouchableOpacity style={styles.restaurantCard}>
            <Image
              source={{ uri: 'https://via.placeholder.com/80x80' }}
              style={styles.restaurantImage}
            />
            <View style={styles.restaurantInfo}>
              <Text style={styles.restaurantName}>Burger Tamo</Text>
              <Text style={styles.rating}>★★★★ 4.0</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Food Categories */}
        <View style={styles.section}>
          <View style={styles.categoryTabs}>
            <TouchableOpacity style={[styles.categoryTab, styles.activeCategory]}>
              <Text style={styles.activeCategoryText}>New Taste</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryTab}>
              <Text style={styles.categoryText}>Popular</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryTab}>
              <Text style={styles.categoryText}>Recommended</Text>
            </TouchableOpacity>
          </View>

          {/* Food Items */}
          <View style={styles.foodGrid}>
            {/* Food 1 */}
            <TouchableOpacity style={styles.foodCard}>
              <Image
                source={{ uri: 'https://via.placeholder.com/120x80' }}
                style={styles.foodImage}
              />
              <View style={styles.foodInfo}>
                <Text style={styles.foodName}>Soup Bumil</Text>
                <Text style={styles.foodPrice}>IDR 289,000</Text>
                <Text style={styles.foodRating}>★★★★ 4.1</Text>
              </View>
            </TouchableOpacity>

            {/* Food 2 */}
            <TouchableOpacity style={styles.foodCard}>
              <Image
                source={{ uri: 'https://via.placeholder.com/120x80' }}
                style={styles.foodImage}
              />
              <View style={styles.foodInfo}>
                <Text style={styles.foodName}>Chicken</Text>
                <Text style={styles.foodPrice}>IDR 4,509,000</Text>
                <Text style={styles.foodRating}>★★★★ 4.7</Text>
              </View>
            </TouchableOpacity>

            {/* Food 3 */}
            <TouchableOpacity style={styles.foodCard}>
              <Image
                source={{ uri: 'https://via.placeholder.com/120x80' }}
                style={styles.foodImage}
              />
              <View style={styles.foodInfo}>
                <Text style={styles.foodName}>Shrimp</Text>
                <Text style={styles.foodPrice}>IDR 999,000</Text>
                <Text style={styles.foodRating}>★★★ 3.2</Text>
              </View>
            </TouchableOpacity>
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
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  restaurantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  restaurantImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  restaurantInfo: {
    marginLeft: 12,
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  rating: {
    fontSize: 14,
    color: '#FF6B35',
  },
  categoryTabs: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  activeCategory: {
    backgroundColor: '#FF6B35',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  activeCategoryText: {
    fontSize: 14,
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
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  foodImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  foodPrice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 4,
  },
  foodRating: {
    fontSize: 12,
    color: '#666',
  },
});
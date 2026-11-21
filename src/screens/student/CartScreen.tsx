import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, FadeOutLeft, LinearTransition } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme';
import { useStudentData } from '../../context/StudentDataContext';
import { ScreenContainer } from '../../components/layout';
import { Button, IconButton, EmptyState } from '../../components/ui';
import { formatPrice } from '../../utils/formatters';
import { StudentStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<StudentStackParamList>;

export const CartScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const { cartItems, removeFromCart, cartTotal } = useStudentData();

  if (cartItems.length === 0) {
    return (
      <ScreenContainer edges={['top']}>
        <View style={styles.header}>
          <IconButton icon="arrow-back" onPress={() => navigation.goBack()} variant="ghost" style={{ marginLeft: -8 }} />
          <Text style={[styles.title, { color: theme.colors.text }]}>Mon panier</Text>
        </View>
        <EmptyState
          icon="cart-outline"
          title="Votre panier est vide"
          actionLabel="Explorer les cours"
          onAction={() => navigation.navigate('StudentTabs', { screen: 'Explore' })}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['top']}>
      <Animated.View entering={FadeInDown.delay(20).springify()} style={styles.header}>
        <IconButton icon="arrow-back" onPress={() => navigation.goBack()} variant="ghost" style={{ marginLeft: -8 }} />
        <Text style={[styles.title, { color: theme.colors.text }]}>Mon panier ({cartItems.length})</Text>
      </Animated.View>

      <FlatList
        data={cartItems}
        keyExtractor={(i) => i.course.id}
        contentContainerStyle={{ paddingBottom: 16 }}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.delay(Math.min(index, 8) * 60).springify()}
            exiting={FadeOutLeft.duration(200)}
            layout={LinearTransition.springify()}
            style={[styles.itemCard, { backgroundColor: theme.colors.card, ...theme.shadow('sm') }]}
          >
            <Image source={{ uri: item.course.thumbnail }} style={styles.thumb} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text numberOfLines={2} style={[styles.itemTitle, { color: theme.colors.text }]}>{item.course.title}</Text>
              <Text style={[styles.itemTeacher, { color: theme.colors.textSecondary }]}>{item.course.teacherName}</Text>
              <Text style={[styles.itemPrice, { color: theme.colors.primary }]}>{formatPrice(item.course.price)}</Text>
            </View>
            <Pressable onPress={() => removeFromCart(item.course.id)} hitSlop={8}>
              <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
            </Pressable>
          </Animated.View>
        )}
      />

      <Animated.View entering={FadeInUp.delay(120).springify()} style={[styles.summary, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <View style={styles.summaryRow}>
          <Text style={{ color: theme.colors.textSecondary }}>Sous-total</Text>
          <Text style={{ color: theme.colors.text, fontWeight: '700' }}>{formatPrice(cartTotal)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={{ color: theme.colors.textSecondary }}>Frais</Text>
          <Text style={{ color: theme.colors.secondary, fontWeight: '700' }}>Gratuit</Text>
        </View>
        <View style={[styles.summaryRow, { marginTop: 6, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.border }]}>
          <Text style={{ color: theme.colors.text, fontWeight: '700', fontSize: 16 }}>Total</Text>
          <Text style={{ color: theme.colors.text, fontWeight: '700', fontSize: 18 }}>{formatPrice(cartTotal)}</Text>
        </View>
        <Button label="Passer au paiement" icon="arrow-forward" iconPosition="right" onPress={() => navigation.navigate('Payment')} style={{ marginTop: 16 }} />
      </Animated.View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 8, marginBottom: 20 },
  title: { fontSize: 19, fontWeight: '700', marginLeft: 4 },
  itemCard: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 16, marginBottom: 12 },
  thumb: { width: 64, height: 64, borderRadius: 12 },
  itemTitle: { fontSize: 13, fontWeight: '700', lineHeight: 17 },
  itemTeacher: { fontSize: 11.5, marginTop: 3 },
  itemPrice: { fontSize: 14, fontWeight: '700', marginTop: 5 },
  summary: { borderTopWidth: 1, paddingTop: 16, paddingHorizontal: 4, paddingBottom: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
});

from django.contrib import admin

from .models import CartItem, Enrollment, Favorite, Payment


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'progress', 'purchased_at']
    list_filter = ['purchased_at']


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'created_at']


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'added_at']


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'amount', 'method', 'status', 'date']
    list_filter = ['method', 'status']

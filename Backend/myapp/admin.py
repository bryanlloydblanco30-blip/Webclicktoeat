from django.contrib import admin
from .models import MenuItem, Cart, CartItem, Order, OrderItem, Favorite

admin.site.register(Favorite)

@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'category', 'available']
    list_filter = ['category', 'available']
    search_fields = ['name', 'description']

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['id', 'session_id', 'created_at', 'total_items', 'total_price']

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ['cart', 'menu_item', 'quantity', 'subtotal']

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'session_id', 'status', 'total_amount', 'payment_method', 'pickup_date', 'pickup_time', 'created_at']
    list_filter = ['status', 'payment_method', 'pickup_date']
    search_fields = ['session_id']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'menu_item', 'quantity', 'price_at_purchase', 'subtotal']
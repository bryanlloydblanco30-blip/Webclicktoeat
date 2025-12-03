# Backend/myapp/urls.py
from django.urls import path
from . import views  # Use relative import since we're in the same app

urlpatterns = [
    # Auth endpoints
    path('api/auth/signup/', views.signup_view, name='signup'),
    path('api/auth/login/', views.login_view, name='login'),
    path('api/auth/logout/', views.logout_view, name='logout'),
    path('api/auth/check/', views.check_auth, name='check_auth'),
    
    # Menu endpoints
    path('api/menu/', views.get_menu_items, name='get_menu_items'),
    
    # Cart endpoints
    path('api/cart/', views.get_cart, name='get_cart'),
    path('api/cart/add/', views.add_to_cart, name='add_to_cart'),
    path('api/cart/update/<int:item_id>/', views.update_cart_item, name='update_cart_item'),
    path('api/cart/remove/<int:item_id>/', views.remove_from_cart, name='remove_from_cart'),
    path('api/cart/remove-by-item/', views.remove_from_cart_by_menu_item, name='remove_cart_by_menu'),
    
    # Order endpoints
    path('api/orders/create/', views.create_order, name='create_order'),
    path('api/orders/', views.get_orders, name='get_orders'),
    
    # Favorites endpoints
    path('api/favorites/', views.get_favorites, name='get_favorites'),
    path('api/favorites/ids/', views.get_favorite_ids, name='get_favorite_ids'),
    path('api/favorites/add/', views.add_favorite, name='add_favorite'),
    path('api/favorites/remove/', views.remove_favorite, name='remove_favorite'),
    
    # Admin endpoints
    path('api/admin/menu/', views.get_all_menu_items_admin, name='admin_menu'),
    path('api/admin/menu/create/', views.create_menu_item, name='create_menu_item'),
    path('api/admin/menu/update/<int:item_id>/', views.update_menu_item, name='update_menu_item'),
    path('api/admin/menu/delete/<int:item_id>/', views.delete_menu_item, name='delete_menu_item'),
    path('api/admin/orders/', views.get_all_orders_admin, name='admin_get_all_orders'),
    path('api/admin/orders/<int:order_id>/status/', views.update_order_status, name='admin_update_order_status'),
    
    # Food Partners endpoints
    path('api/partners/', views.get_food_partners, name='get_food_partners'),
    path('api/partners/<str:partner_name>/menu/', views.get_partner_menu_items, name='get_partner_menu'),
    
    # Partner Staff endpoints
    path('api/partner/orders/', views.get_partner_orders, name='partner_orders'),
    path('api/partner/orders/<int:order_id>/status/', views.update_partner_order_status, name='partner_update_status'),
]
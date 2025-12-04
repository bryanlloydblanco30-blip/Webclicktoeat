from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.views.decorators.http import require_http_methods
from django.db.models import F, Sum
import json
from .models import MenuItem, Cart, CartItem, Order, OrderItem, Favorite
from datetime import datetime
from urllib.parse import unquote
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
from datetime import timedelta
from django.utils import timezone
from .models import UserProfile
from django.contrib.auth.hashers import check_password
from django.core.management import call_command

from django.contrib.auth.models import User
from myapp.models import UserProfile
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse

from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse

@csrf_exempt
def create_users(request):
    if request.method == 'POST':
        try:
            # Create Admin User
            if not User.objects.filter(username='admin').exists():
                admin = User.objects.create_superuser(
                    username='admin',
                    email='admin@clicktoeat.com',
                    password='Admin123!'
                )
                UserProfile.objects.create(
                    user=admin,
                    role='admin',
                    full_name='System Administrator',
                    sr_code='ADMIN001'
                )
            
            # Create Staff Users
            partners = [
                ('theatery', 'Theatery Food Hub', 'Theatery Owner'),
                ('potato', 'Potato Corner', 'Potato Corner Owner'),
                ('chowking', 'Chowking', 'Chowking Owner'),
                ('spotg', 'SpotG', 'SpotG Owner'),
            ]
            
            for username, partner_name, full_name in partners:
                if not User.objects.filter(username=username).exists():
                    staff = User.objects.create_user(
                        username=username,
                        email=f'{username}@clicktoeat.com',
                        password='Staff123!'
                    )
                    UserProfile.objects.create(
                        user=staff,
                        role='staff',
                        food_partner=partner_name,
                        full_name=full_name,
                        sr_code=''
                    )
            
            return JsonResponse({'message': 'Users created successfully!'})
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'POST only'}, status=400)

# ==================== AUTHENTICATION VIEWS ====================

@csrf_exempt  # Add this line
@require_http_methods(["POST"])
def signup_view(request):
    """User signup"""
    try:
        data = json.loads(request.body)
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        role = data.get('role', 'member')
        food_partner = data.get('food_partner', '')
        full_name = data.get('full_name', '')
        sr_code = data.get('sr_code', '')
        
        # Validation
        if not all([username, email, password, full_name, sr_code]):
            return JsonResponse({'error': 'All fields required'}, status=400)
        
        # Check if user exists
        if User.objects.filter(username=username).exists():
            return JsonResponse({'error': 'Username already exists'}, status=400)
        
        if User.objects.filter(email=email).exists():
            return JsonResponse({'error': 'Email already exists'}, status=400)
        
        # Check if SR code already exists
        
        if UserProfile.objects.filter(sr_code=sr_code).exists():
            return JsonResponse({'error': 'SR Code already registered'}, status=400)
        
        # Create user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        
        # Create profile
        profile = UserProfile.objects.create(
            user=user,
            role=role,
            food_partner=food_partner if role == 'staff' else '',
            full_name=full_name,
            sr_code=sr_code
        )
 
        # Log the user in (creates session)
        login(request, user)
        
        return JsonResponse({
            'success': True,
            'message': 'Account created successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': profile.role,
                'food_partner': profile.food_partner,
                'full_name': profile.full_name,
                'sr_code': profile.sr_code
            }
        }, status=201)
        
    except Exception as e:
        print(f"Signup error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt  # Add this line
@require_http_methods(["POST"])
@csrf_exempt
@require_http_methods(["POST"])
def login_view(request):
    """User login"""
    try:
        print("=" * 50)
        print("LOGIN VIEW CALLED")
        print(f"Method: {request.method}")
        print(f"Path: {request.path}")
        print("=" * 50)
        
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        
        print(f"Username: {username}")
        print(f"Password length: {len(password) if password else 0}")
        
        if not all([username, password]):
            return JsonResponse({'error': 'Username and password required'}, status=400)
        
        # Check if user exists first
        from django.contrib.auth.models import User
        try:
            user_obj = User.objects.get(username=username)
            print(f"✅ User exists: ID={user_obj.id}, username={user_obj.username}")
            print(f"✅ User is_active: {user_obj.is_active}")
            print(f"✅ Password hash (first 50): {user_obj.password[:50]}")
        except User.DoesNotExist:
            print(f"❌ User '{username}' does not exist in database")
            return JsonResponse({'error': 'Invalid credentials'}, status=401)
        
        # Try to authenticate
        print("Attempting authentication...")
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            print(f"✅ Authentication successful!")
            print(f"✅ Authenticated user: {user.username} (ID: {user.id})")
            
            # Login creates the session
            login(request, user)
            
            # Get user profile
            try:
                profile = user.profile
                print(f"✅ Profile found: role={profile.role}")
            except Exception as e:
                print(f"⚠️ Profile error: {e}")
                profile = None
            
            response_data = {
                'success': True,
                'message': 'Login successful',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'role': profile.role if profile else 'member',
                    'food_partner': profile.food_partner if profile else '',
                    'full_name': getattr(profile, 'full_name', '') if profile else '',
                    'sr_code': getattr(profile, 'sr_code', '') if profile else '',
                }
            }
            
            print(f"✅ Sending success response")
            return JsonResponse(response_data)
            
        else:
            print(f"❌ authenticate() returned None")
            print(f"❌ Credentials did not match")
            
            # Manual check - does the password match?
            
            manual_check = check_password(password, user_obj.password)
            print(f"Manual password check: {manual_check}")
            
            return JsonResponse({'error': 'Invalid credentials'}, status=401)
            
    except Exception as e:
        print(f"❌ Login exception: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)
@require_http_methods(["POST"])
def logout_view(request):
    """User logout"""
    try:
        logout(request)
        return JsonResponse({
            'success': True,
            'message': 'Logged out successfully'
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["GET"])
def check_auth(request):
    """Check if user is authenticated"""
    if request.user.is_authenticated:
        try:
            profile = request.user.profile
            return JsonResponse({
                'authenticated': True,
                'user': {
                    'id': request.user.id,
                    'username': request.user.username,
                    'email': request.user.email,
                    'role': profile.role,
                    'food_partner': profile.food_partner,
                    'full_name': getattr(profile, 'full_name', ''),
                    'sr_code': getattr(profile, 'sr_code', ''),
                }
            })
        except Exception as e:
            # If profile doesn't exist
            return JsonResponse({
                'authenticated': True,
                'user': {
                    'id': request.user.id,
                    'username': request.user.username,
                    'email': request.user.email,
                    'role': 'member',
                    'food_partner': '',
                }
            })
    else:
        return JsonResponse({
            'authenticated': False,
            'user': None
        }, status=401)


# ==================== MENU VIEWS ====================

def get_menu_items(request):
    """Get all available menu items (public)"""
    items = MenuItem.objects.all()  # Changed from filter(available=True)
    data = [{
        'id': item.id,
        'name': item.name,
        'description': item.description,
        'price': str(item.price),
        'image_url': item.image_url,
        'category': item.category,
        'food_partner': item.food_partner,
        'available': item.available,  # Added this field so frontend knows status
    } for item in items]
    return JsonResponse({'items': data})

def get_all_menu_items_admin(request):
    """Get all menu items including unavailable (admin)"""
    items = MenuItem.objects.all()
    data = [{
        'id': item.id,
        'name': item.name,
        'description': item.description,
        'price': str(item.price),
        'image_url': item.image_url,
        'category': item.category,
        'food_partner': item.food_partner,
        'available': item.available,
        'created_at': item.created_at.isoformat()
    } for item in items]
    return JsonResponse({'items': data})

@require_http_methods(["POST"])
def create_menu_item(request):
    """Create a new menu item (admin)"""
    try:
        data = json.loads(request.body)
        menu_item = MenuItem.objects.create(
            name=data.get('name'),
            description=data.get('description', ''),
            price=data.get('price'),
            image_url=data.get('image_url', ''),
            category=data.get('category', ''),
            food_partner=data.get('food_partner', ''),
            available=data.get('available', True)
        )
        return JsonResponse({
            'message': 'Menu item created successfully',
            'item': {
                'id': menu_item.id,
                'name': menu_item.name,
                'description': menu_item.description,
                'price': str(menu_item.price),
                'image_url': menu_item.image_url,
                'category': menu_item.category,
                'food_partner': menu_item.food_partner,
                'available': menu_item.available
            }
        }, status=201)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@require_http_methods(["PUT"])
def update_menu_item(request, item_id):
    """Update a menu item (admin)"""
    try:
        data = json.loads(request.body)
        menu_item = MenuItem.objects.get(id=item_id)
        menu_item.name = data.get('name', menu_item.name)
        menu_item.description = data.get('description', menu_item.description)
        menu_item.price = data.get('price', menu_item.price)
        menu_item.image_url = data.get('image_url', menu_item.image_url)
        menu_item.category = data.get('category', menu_item.category)
        menu_item.food_partner = data.get('food_partner', menu_item.food_partner)
        menu_item.available = data.get('available', menu_item.available)
        menu_item.save()
        return JsonResponse({
            'message': 'Menu item updated successfully',
            'item': {
                'id': menu_item.id,
                'name': menu_item.name,
                'description': menu_item.description,
                'price': str(menu_item.price),
                'image_url': menu_item.image_url,
                'category': menu_item.category,
                'food_partner': menu_item.food_partner,
                'available': menu_item.available
            }
        })
    except MenuItem.DoesNotExist:
        return JsonResponse({'error': 'Menu item not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@require_http_methods(["DELETE"])
def delete_menu_item(request, item_id):
    """Delete a menu item (admin)"""
    try:
        menu_item = MenuItem.objects.get(id=item_id)
        
        # Check if item is in any existing orders
        order_items_count = OrderItem.objects.filter(menu_item=menu_item).count()
        if order_items_count > 0:
            return JsonResponse({
                'error': f'Cannot delete: This item is in {order_items_count} order(s). Mark as unavailable instead.'
            }, status=400)
        
        # Delete related cart items first (manual cascade)
        cart_items_deleted = CartItem.objects.filter(menu_item=menu_item).delete()[0]
        print(f"Deleted {cart_items_deleted} cart items for menu item {item_id}")
        
        # Delete related favorites
        favorites_deleted = Favorite.objects.filter(menu_item=menu_item).delete()[0]
        print(f"Deleted {favorites_deleted} favorites for menu item {item_id}")
        
        # Now safe to delete the menu item
        menu_item.delete()
        
        return JsonResponse({
            'success': True,
            'message': 'Menu item deleted successfully'
        })
        
    except MenuItem.DoesNotExist:
        return JsonResponse({'error': 'Menu item not found'}, status=404)
    except Exception as e:
        print(f"Error deleting menu item: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)

# ==================== CART VIEWS ====================

def get_cart(request):
    """Get cart contents for a session"""
    try:
        session_id = request.GET.get('session_id')
        if not session_id:
            return JsonResponse({'cart': [], 'total': '0.00', 'item_count': 0})
        
        # Get or create cart for this session
        cart = Cart.objects.filter(session_id=session_id).first()
        
        if not cart:
            return JsonResponse({'cart': [], 'total': '0.00', 'item_count': 0})
        
        # Get all cart items with related menu items
        cart_items = CartItem.objects.filter(cart=cart).select_related('menu_item')
        
        items_data = []
        for item in cart_items:
            items_data.append({
                'id': item.id,
                'menu_item_id': item.menu_item.id,
                'name': item.menu_item.name,
                'description': item.menu_item.description,
                'price': str(item.menu_item.price),
                'image_url': item.menu_item.image_url,
                'category': item.menu_item.category,
                'quantity': item.quantity,
                'subtotal': str(item.subtotal)
            })
        
        return JsonResponse({
            'cart': items_data,
            'total': str(cart.total_price),
            'item_count': cart.total_items
        })
    except Exception as e:
        print(f"Error getting cart: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

@require_http_methods(["POST"])
def add_to_cart(request):
    """Add an item to the cart"""
    try:
        data = json.loads(request.body)
        menu_item_id = data.get('menu_item_id')
        quantity = data.get('quantity', 1)
        session_id = data.get('session_id')
        
        print(f"Add to cart request: menu_item_id={menu_item_id}, quantity={quantity}, session_id={session_id}")
        
        if not session_id:
            return JsonResponse({'error': 'Session ID required'}, status=400)
        
        if not menu_item_id:
            return JsonResponse({'error': 'Menu item ID required'}, status=400)
        
        # Get or create cart for this session
        cart, created = Cart.objects.get_or_create(session_id=session_id)
        print(f"Cart {'created' if created else 'found'}: {cart.id}")
        
        # Get the menu item
        try:
            menu_item = MenuItem.objects.get(id=menu_item_id, available=True)
        except MenuItem.DoesNotExist:
            return JsonResponse({'error': 'Menu item not found or unavailable'}, status=404)
        
        # Get or create cart item
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            menu_item=menu_item,
            defaults={'quantity': quantity}
        )
        
        if not created:
            # Item already exists, increase quantity
            cart_item.quantity += quantity
            cart_item.save()
            print(f"Updated existing cart item. New quantity: {cart_item.quantity}")
        else:
            print(f"Created new cart item with quantity: {cart_item.quantity}")
        
        return JsonResponse({
            'success': True,
            'message': 'Added to cart successfully',
            'cart_item_id': cart_item.id,
            'quantity': cart_item.quantity,
            'cart_total': str(cart.total_price),
            'cart_items': cart.total_items
        })
    except Exception as e:
        print(f"Error in add_to_cart: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)

@require_http_methods(["PUT"])
def update_cart_item(request, item_id):
    """Update quantity of a cart item"""
    try:
        data = json.loads(request.body)
        quantity = data.get('quantity')
        
        if quantity is None or quantity < 1:
            return JsonResponse({'error': 'Invalid quantity'}, status=400)
        
        cart_item = CartItem.objects.get(id=item_id)
        cart_item.quantity = quantity
        cart_item.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Cart item updated successfully',
            'quantity': cart_item.quantity,
            'subtotal': str(cart_item.subtotal),
            'cart_total': str(cart_item.cart.total_price)
        })
    except CartItem.DoesNotExist:
        return JsonResponse({'error': 'Cart item not found'}, status=404)
    except Exception as e:
        print(f"Error updating cart item: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

@require_http_methods(["DELETE"])
def remove_from_cart(request, item_id):
    """Remove an item from the cart"""
    try:
        cart_item = CartItem.objects.get(id=item_id)
        cart = cart_item.cart
        cart_item.delete()
        
        return JsonResponse({
            'success': True,
            'message': 'Item removed from cart successfully',
            'cart_total': str(cart.total_price),
            'cart_items': cart.total_items
        })
    except CartItem.DoesNotExist:
        return JsonResponse({'error': 'Cart item not found'}, status=404)
    except Exception as e:
        print(f"Error removing from cart: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

@require_http_methods(["DELETE"])
def remove_from_cart_by_menu_item(request):
    """Remove an item from cart by menu_item_id and session_id"""
    try:
        session_id = request.GET.get('session_id')
        menu_item_id = request.GET.get('menu_item_id')
        
        if not session_id or not menu_item_id:
            return JsonResponse({'error': 'session_id and menu_item_id required'}, status=400)
        
        cart = Cart.objects.filter(session_id=session_id).first()
        if not cart:
            return JsonResponse({'error': 'Cart not found'}, status=404)
        
        cart_item = CartItem.objects.filter(cart=cart, menu_item_id=menu_item_id).first()
        if not cart_item:
            return JsonResponse({'error': 'Item not in cart'}, status=404)
            
        cart_item.delete()
        
        return JsonResponse({
            'success': True,
            'message': 'Item removed from cart',
            'cart_total': str(cart.total_price),
            'cart_items': cart.total_items
        })
    except Exception as e:
        print(f"Error removing from cart: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

# ==================== ORDER VIEWS ====================

@require_http_methods(["POST"])
def create_order(request):
    """Create a new order from cart"""
    try:
        print("=" * 50)
        print("CREATE ORDER REQUEST RECEIVED")
        print("=" * 50)
        
        data = json.loads(request.body)
        print(f"Request data: {data}")
        
        session_id = data.get('session_id')
        payment_method = data.get('payment_method')
        tip_amount = data.get('tip', 0)
        pickup_datetime = data.get('pickup_time')
        customer_name = data.get('customer_name', '')
        
        print(f"Session ID: {session_id}")
        print(f"Customer Name: {customer_name}")
        print(f"Payment: {payment_method}")
        print(f"Tip: {tip_amount}")
        print(f"Pickup: {pickup_datetime}")
        
        if not all([session_id, payment_method, pickup_datetime]):
            print("ERROR: Missing required fields")
            return JsonResponse({'error': 'Missing required fields'}, status=400)
        
        # Get cart
        cart = Cart.objects.filter(session_id=session_id).first()
        print(f"Cart found: {cart}")
        
        if not cart:
            print("ERROR: Cart not found")
            return JsonResponse({'error': 'Cart not found'}, status=400)
            
        cart_items = cart.items.all()
        print(f"Cart items count: {cart_items.count()}")
        
        if cart_items.count() == 0:
            print("ERROR: Cart is empty")
            return JsonResponse({'error': 'Cart is empty'}, status=400)
        
        # Parse pickup datetime
        try:
            pickup_dt = datetime.fromisoformat(pickup_datetime.replace('Z', '+00:00'))
        except:
            pickup_dt = datetime.strptime(pickup_datetime, '%Y-%m-%dT%H:%M')
        
        print(f"Parsed pickup datetime: {pickup_dt}")
        
        # Create order
        order = Order.objects.create(
            session_id=session_id,
            customer_name=customer_name,
            total_amount=cart.total_price,
            tip_amount=tip_amount,
            payment_method=payment_method,
            pickup_date=pickup_dt.date(),
            pickup_time=pickup_dt.time(),
            status='pending'
        )
        print(f"✅ Order created: #{order.id}")
        
        # Create order items from cart
        for cart_item in cart_items:
            order_item = OrderItem.objects.create(
                order=order,
                menu_item=cart_item.menu_item,
                quantity=cart_item.quantity,
                price_at_purchase=cart_item.menu_item.price
            )
            print(f"✅ Order item created: {order_item}")
        
        # Clear the cart
        deleted_count, _ = cart_items.delete()
        print(f"✅ Deleted {deleted_count} cart items")
        
        print("=" * 50)
        print(f"ORDER #{order.id} CREATED SUCCESSFULLY")
        print("=" * 50)
        
        return JsonResponse({
            'success': True,
            'message': 'Order created successfully',
            'order_id': order.id,
            'order': {
                'id': order.id,
                'customer_name': order.customer_name,
                'total': str(order.total_amount + order.tip_amount),
                'status': order.status,
                'pickup_date': order.pickup_date.isoformat(),
                'pickup_time': order.pickup_time.isoformat(),
            }
        }, status=201)
        
    except Exception as e:
        print(f"❌ ERROR in create_order: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)

def get_orders(request):
    """Get all orders for a session"""
    try:
        session_id = request.GET.get('session_id')
        if not session_id:
            return JsonResponse({'orders': []})
        
        orders = Order.objects.filter(session_id=session_id).order_by('-created_at')
        
        orders_data = []
        for order in orders:
            items_data = [{
                'name': item.menu_item.name,
                'quantity': item.quantity,
                'price': str(item.price_at_purchase),
                'subtotal': str(item.subtotal)
            } for item in order.items.all()]
            
            orders_data.append({
                'id': order.id,
                'total': str(order.total_amount + order.tip_amount),
                'tip': str(order.tip_amount),
                'payment_method': order.payment_method,
                'pickup_date': order.pickup_date.isoformat(),
                'pickup_time': order.pickup_time.isoformat(),
                'status': order.status,
                'created_at': order.created_at.isoformat(),
                'customer_name': order.customer_name or f'Guest #{order.session_id[:8]}',  # ✅ This line
                'items': items_data
            })
        
        return JsonResponse({'orders': orders_data})
    except Exception as e:
        print(f"Error getting orders: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

# ==================== FAVORITE VIEWS ====================

@require_http_methods(["POST"])
def add_favorite(request):
    """Add item to favorites"""
    try:
        data = json.loads(request.body)
        menu_item_id = data.get('menu_item_id')
        session_id = data.get('session_id')
        
        if not session_id or not menu_item_id:
            return JsonResponse({'error': 'session_id and menu_item_id required'}, status=400)
        
        # Check if menu item exists
        try:
            menu_item = MenuItem.objects.get(id=menu_item_id)
        except MenuItem.DoesNotExist:
            return JsonResponse({'error': 'Menu item not found'}, status=404)
        
        # Create or get favorite (prevents duplicates)
        favorite, created = Favorite.objects.get_or_create(
            session_id=session_id,
            menu_item=menu_item
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Added to favorites' if created else 'Already in favorites',
            'favorite_id': favorite.id
        })
    except Exception as e:
        print(f"Error adding favorite: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

@require_http_methods(["DELETE"])
def remove_favorite(request):
    """Remove item from favorites"""
    try:
        session_id = request.GET.get('session_id')
        menu_item_id = request.GET.get('menu_item_id')
        
        if not session_id or not menu_item_id:
            return JsonResponse({'error': 'session_id and menu_item_id required'}, status=400)
        
        favorite = Favorite.objects.filter(
            session_id=session_id,
            menu_item_id=menu_item_id
        ).first()
        
        if not favorite:
            return JsonResponse({'error': 'Favorite not found'}, status=404)
        
        favorite.delete()
        
        return JsonResponse({
            'success': True,
            'message': 'Removed from favorites'
        })
    except Exception as e:
        print(f"Error removing favorite: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

def get_favorites(request):
    """Get all favorites for a session"""
    try:
        session_id = request.GET.get('session_id')
        
        if not session_id:
            return JsonResponse({'favorites': []})
        
        favorites = Favorite.objects.filter(session_id=session_id).select_related('menu_item')
        
        favorites_data = []
        for fav in favorites:
            favorites_data.append({
                'id': fav.id,
                'menu_item': {
                    'id': fav.menu_item.id,
                    'name': fav.menu_item.name,
                    'description': fav.menu_item.description,
                    'price': str(fav.menu_item.price),
                    'image_url': fav.menu_item.image_url,
                    'category': fav.menu_item.category
                },
                'created_at': fav.created_at.isoformat()
            })
        
        return JsonResponse({'favorites': favorites_data})
    except Exception as e:
        print(f"Error getting favorites: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

def get_favorite_ids(request):
    """Get just the menu item IDs that are favorited (for quick checking)"""
    try:
        session_id = request.GET.get('session_id')
        
        if not session_id:
            return JsonResponse({'favorite_ids': []})
        
        favorite_ids = list(
            Favorite.objects.filter(session_id=session_id)
            .values_list('menu_item_id', flat=True)
        )
        
        return JsonResponse({'favorite_ids': favorite_ids})
    except Exception as e:
        print(f"Error getting favorite IDs: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

# ==================== FOOD PARTNER VIEWS ====================

def get_food_partners(request):
    """Get all active food partners with their menu items"""
    try:
        partners = MenuItem.objects.filter(
            available=True
        ).values('food_partner').distinct().exclude(food_partner='')
        
        partners_data = []
        for partner in partners:
            partner_name = partner['food_partner']
            items = MenuItem.objects.filter(
                food_partner=partner_name,
                available=True
            )
            partner_image = items.first().image_url if items.exists() else ''
            
            partners_data.append({
                'name': partner_name,
                'image_url': partner_image,
                'item_count': items.count()
            })
        
        return JsonResponse({'partners': partners_data})
    except Exception as e:
        print(f"Error getting food partners: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


def get_partner_menu_items(request, partner_name):
    """Get all menu items for a specific food partner"""
    try:
        # Decode URL-encoded partner name
        decoded_partner_name = unquote(partner_name)
        
        print(f"=" * 50)
        print(f"GET PARTNER MENU REQUEST")
        print(f"Raw partner_name: {partner_name}")
        print(f"Decoded partner_name: {decoded_partner_name}")
        print(f"=" * 50)
        
        # Changed from filter(food_partner=..., available=True)
        items = MenuItem.objects.filter(
            food_partner=decoded_partner_name
        )
        
        print(f"Found {items.count()} items for partner: {decoded_partner_name}")
        
        # If no items found, try to find what partners exist
        if items.count() == 0:
            all_partners = MenuItem.objects.values_list('food_partner', flat=True).distinct()
            print(f"Available partners in database: {list(all_partners)}")
        
        data = [{
            'id': item.id,
            'name': item.name,
            'description': item.description,
            'price': str(item.price),
            'image_url': item.image_url,
            'category': item.category,
            'food_partner': item.food_partner,
            'available': item.available,  # Added this
        } for item in items]
        
        print(f"Returning {len(data)} items")
        print(f"=" * 50)
        
        return JsonResponse({
            'partner': decoded_partner_name,
            'items': data,
            'count': len(data)
        })
    except Exception as e:
        print(f"Error getting partner menu items: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)
    
    # ==================== ADMIN ORDER VIEWS ====================

# ==================== PARTNER STAFF VIEWS ====================

def get_partner_orders(request):
    """Get orders containing items from a specific food partner"""
    try:
        partner_name = request.GET.get('partner')
        
        if not partner_name:
            return JsonResponse({'error': 'Partner name required'}, status=400)
        
        # Get all orders that have items from this partner
        orders_with_partner_items = Order.objects.filter(
            items__menu_item__food_partner=partner_name
        ).distinct().order_by('-created_at')
        
        orders_data = []
        for order in orders_with_partner_items:
            # Only get items from this specific partner
            partner_items = OrderItem.objects.filter(
                order=order,
                menu_item__food_partner=partner_name
            )
            
            items_data = [{
                'name': item.menu_item.name,
                'quantity': item.quantity,
                'price': str(item.price_at_purchase),
                'subtotal': str(item.subtotal),
                'food_partner': item.menu_item.food_partner
            } for item in partner_items]
            
            # Calculate partner-specific total
            partner_total = sum(item.subtotal for item in partner_items)
            
            orders_data.append({
                'id': order.id,
                'total': str(partner_total),
                'tip': str(order.tip_amount),
                'payment_method': order.payment_method,
                'pickup_date': order.pickup_date.isoformat(),
                'pickup_time': order.pickup_time.isoformat(),
                'status': order.status,
                'created_at': order.created_at.isoformat(),
                'customer_name': order.customer_name if order.customer_name else f'Customer #{order.session_id[:8]}',  # FIXED
                'items': items_data
            })
        
        return JsonResponse({
            'partner': partner_name,
            'orders': orders_data,
            'count': len(orders_data)
        })
        
    except Exception as e:
        print(f"Error getting partner orders: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["PATCH"])
def update_partner_order_status(request, order_id):
    """Update order status (Partner Staff)"""
    try:
        data = json.loads(request.body)
        new_status = data.get('status')
        
        # Validate status
        valid_statuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']
        if new_status not in valid_statuses:
            return JsonResponse({'error': 'Invalid status'}, status=400)
        
        # Get and update order
        order = Order.objects.get(id=order_id)
        order.status = new_status
        order.save()
        
        print(f"✅ Order #{order_id} status updated to: {new_status}")
        
        return JsonResponse({
            'success': True,
            'order_id': order.id,
            'status': order.status
        })
        
    except Order.DoesNotExist:
        return JsonResponse({'error': 'Order not found'}, status=404)
    except Exception as e:
        print(f"Error updating order: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)
    
    # ==================== ADMIN ORDER VIEWS ====================

def get_all_orders_admin(request):
    """Get all orders for admin dashboard"""
    try:
        # Get all orders, newest first
        orders = Order.objects.all().order_by('-created_at')
        
        orders_data = []
        for order in orders:
            # Get order items
            order_items = OrderItem.objects.filter(order=order)
            items_data = [{
                'name': item.menu_item.name,
                'quantity': item.quantity,
                'price': str(item.price_at_purchase),
                'subtotal': str(item.subtotal),
                'food_partner': item.menu_item.food_partner
            } for item in order_items]
            
            orders_data.append({
                'id': order.id,
                'total': str(order.total_amount + order.tip_amount),
                'tip': str(order.tip_amount),
                'payment_method': order.payment_method,
                'pickup_date': order.pickup_date.isoformat(),
                'pickup_time': order.pickup_time.isoformat(),
                'status': order.status,
                'created_at': order.created_at.isoformat(),
                'customer_name': order.customer_name if order.customer_name else f'Customer #{order.session_id[:8]}',
                'items': items_data
            })
        
        return JsonResponse({'orders': orders_data})
    except Exception as e:
        print(f"Error getting admin orders: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)



@require_http_methods(["PATCH"])
def update_order_status(request, order_id):
    """Update order status (for API compatibility - but admin panel is now read-only)"""
    try:
        data = json.loads(request.body)
        new_status = data.get('status')
        
        # Validate status
        valid_statuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']
        if new_status not in valid_statuses:
            return JsonResponse({'error': 'Invalid status'}, status=400)
        
        # Get and update order
        order = Order.objects.get(id=order_id)
        order.status = new_status
        order.save()
        
        print(f"✅ Order #{order_id} status updated to: {new_status}")
        
        return JsonResponse({
            'success': True,
            'order_id': order.id,
            'status': order.status
        })
        
    except Order.DoesNotExist:
        return JsonResponse({'error': 'Order not found'}, status=404)
    except Exception as e:
        print(f"Error updating order: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)
    
@method_decorator(csrf_exempt, name='dispatch')
class CancelOrderView(View):
    def post(self, request, order_id):
        try:
            # Fetch the order first
            order = Order.objects.get(id=order_id)
            
            # Check cancellation window
            if timezone.now() - order.created_at > timedelta(minutes=1):
                return JsonResponse({'error': 'Cancellation window has expired'}, status=400)

            # Cancel the order
            order.status = 'cancelled'
            order.save()

            return JsonResponse({'success': True, 'message': 'Order cancelled successfully'})

        except Order.DoesNotExist:
            return JsonResponse({'error': 'Order not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
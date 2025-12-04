from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({"status": "ok", "message": "Backend is running"})

urlpatterns = [
    path('', health_check),  # Root endpoint for testing
    path('admin/', admin.site.urls),
    path('api/', include('myapp.urls')),
]
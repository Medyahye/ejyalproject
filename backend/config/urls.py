from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/', include('catalog.urls')),
    path('api/', include('commerce.urls')),
    path('api/', include('live.urls')),
    path('api/staff/', include('accounts.staff_urls')),
]

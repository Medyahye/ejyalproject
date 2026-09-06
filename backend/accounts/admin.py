from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    ordering = ['-created_at']
    list_display = ['email', 'full_name', 'role', 'is_staff', 'created_at']
    list_filter = ['role', 'is_staff', 'is_active']
    search_fields = ['email', 'full_name']
    readonly_fields = ['id', 'created_at']
    fieldsets = (
        (None, {'fields': ('id', 'email', 'password')}),
        ('Profil', {'fields': ('full_name', 'avatar', 'role', 'bio', 'headline', 'specialties')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Dates', {'fields': ('created_at', 'last_login')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'full_name', 'role', 'password1', 'password2'),
        }),
    )

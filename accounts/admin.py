from django.contrib import admin
from .models import Profile, Bounty

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'profile_pic')

@admin.register(Bounty)
class BountyAdmin(admin.ModelAdmin):
    list_display = ('title', 'hunter', 'reward', 'created_at')
    search_fields = ('title', 'description')
    list_filter = ('created_at',)
    ordering = ('-created_at',)

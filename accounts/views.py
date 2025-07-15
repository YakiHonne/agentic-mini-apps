from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from .models import Bounty
from .forms import BountyForm
from django.contrib import messages

def home(request):
    bounties = Bounty.objects.select_related('hunter').order_by('-created_at')
    return render(request, 'accounts/home.html', {'bounties': bounties})

def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('home')  # Redirect to homepage after login
        else:
            messages.error(request, 'Invalid username or password.')

    return render(request, 'accounts/login.html')

def logout_view(request):
    logout(request)
    return redirect('login')  # Redirect to login page after logout

@login_required
def create_bounty(request):
    if request.method == 'POST':
        form = BountyForm(request.POST)
        if form.is_valid():
            bounty = form.save(commit=False)
            bounty.hunter = request.user
            bounty.save()
            return redirect('home')  # or wherever you want
    else:
        form = BountyForm()
    return render(request, 'accounts/create_bounty.html', {'form': form})

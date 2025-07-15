from django import forms
from .models import Bounty

class BountyForm(forms.ModelForm):
  class Meta:
    model = Bounty
    fields = ['title', 'description', 'reward']
    widgets = {
        'title': forms.TextInput(attrs={'class': 'form-control'}),
        'description': forms.Textarea(attrs={'class': 'form-control'}),
        'reward': forms.NumberInput(attrs={'class': 'form-control'}),
    }

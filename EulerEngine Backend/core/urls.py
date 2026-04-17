from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, ProblemViewSet, RubricViewSet, ContestViewSet,
    ContestProblemViewSet, ContestRegistrationViewSet, SubmissionViewSet, LeaderboardViewSet,
    RegisterView, LoginView
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'problems', ProblemViewSet)
router.register(r'rubrics', RubricViewSet)
router.register(r'contests', ContestViewSet)
router.register(r'contest-problems', ContestProblemViewSet)
router.register(r'contest-registrations', ContestRegistrationViewSet)
router.register(r'submissions', SubmissionViewSet)
router.register(r'leaderboards', LeaderboardViewSet)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('', include(router.urls)),
]

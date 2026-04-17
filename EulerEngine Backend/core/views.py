from rest_framework import viewsets
from .models import User, Problem, Rubric, Contest, ContestProblem, ContestRegistration, Submission, Leaderboard
from .serializers import (
    UserSerializer, ProblemSerializer, RubricSerializer, ContestSerializer,
    ContestProblemSerializer, ContestRegistrationSerializer, SubmissionSerializer, LeaderboardSerializer
)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class ProblemViewSet(viewsets.ModelViewSet):
    queryset = Problem.objects.all()
    serializer_class = ProblemSerializer

class RubricViewSet(viewsets.ModelViewSet):
    queryset = Rubric.objects.all()
    serializer_class = RubricSerializer

class ContestViewSet(viewsets.ModelViewSet):
    queryset = Contest.objects.all()
    serializer_class = ContestSerializer

class ContestProblemViewSet(viewsets.ModelViewSet):
    queryset = ContestProblem.objects.all()
    serializer_class = ContestProblemSerializer

class ContestRegistrationViewSet(viewsets.ModelViewSet):
    queryset = ContestRegistration.objects.all()
    serializer_class = ContestRegistrationSerializer

class SubmissionViewSet(viewsets.ModelViewSet):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer

class LeaderboardViewSet(viewsets.ModelViewSet):
    queryset = Leaderboard.objects.all()
    serializer_class = LeaderboardSerializer

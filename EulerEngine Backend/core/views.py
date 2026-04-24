import threading
import requests
import re
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .models import User, Problem, Contest, ContestProblem, ContestRegistration, Submission, Leaderboard
from .serializers import (
    UserSerializer, ProblemSerializer, ContestSerializer, 
    ContestProblemSerializer, ContestRegistrationSerializer, SubmissionSerializer, LeaderboardSerializer
)

class RegisterView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key, 'user_id': user.user_id, 'username': user.username}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        user = None
        if username:
            user = authenticate(username=username, password=password)
        elif email:
            try:
                user_obj = User.objects.get(email=email)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass
        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key, 
                'user_id': user.user_id, 
                'username': user.username, 
                'email': user.email,
                'is_staff': user.is_staff
            })
        return Response({'non_field_errors': ['Invalid credentials']}, status=status.HTTP_400_BAD_REQUEST)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class ProblemViewSet(viewsets.ModelViewSet):
    queryset = Problem.objects.all()
    serializer_class = ProblemSerializer

class ContestViewSet(viewsets.ModelViewSet):
    queryset = Contest.objects.all()
    serializer_class = ContestSerializer

class ContestProblemViewSet(viewsets.ModelViewSet):
    queryset = ContestProblem.objects.all()
    serializer_class = ContestProblemSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        contest_id = self.request.query_params.get('contest')
        if contest_id:
            queryset = queryset.filter(contest_id=contest_id)
        return queryset

class ContestRegistrationViewSet(viewsets.ModelViewSet):
    queryset = ContestRegistration.objects.all()
    serializer_class = ContestRegistrationSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        contest_id = self.request.query_params.get('contest')
        user_id = self.request.query_params.get('user')
        if contest_id:
            queryset = queryset.filter(contest_id=contest_id)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        return queryset

def grade_submission_task(submission_id):
    try:
        submission = Submission.objects.get(submission_id=submission_id)
        # Find the problem
        problem = submission.problem
        
        correct_answer = problem.reference_solution if problem.reference_solution else "No reference solution provided."
        max_pts = problem.max_points if problem.max_points else 10
        
        prompt = f"""
You are a math grader.

Correct explanation:
{correct_answer}

Student explanation:
{submission.answer_text}

Output EXACTLY:
Score: X/{max_pts}
Feedback: Your brief feedback here.
"""
        
        response = requests.post(
            "http://localhost:11434/api/chat",
            json={
                "model": "llama3",
                "messages": [{"role": "user", "content": prompt}],
                "stream": False
            },
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            output = data.get("message", {}).get("content", "")
            
            # Extract score
            match = re.search(r"Score:\s*(\d+)", output)
            score = int(match.group(1)) if match else 0
            
            # Update submission
            submission.score = score
            submission.ai_feedback = output
            submission.grading_status = Submission.GradingStatusChoices.GRADED
            submission.save()
            print(f"Submission {submission_id} graded: {score} points.")
        else:
            print(f"Ollama error for submission {submission_id}: {response.status_code}")
            
    except Exception as e:
        print(f"Grading error for submission {submission_id}: {str(e)}")

class SubmissionViewSet(viewsets.ModelViewSet):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        contest_id = self.request.query_params.get('contest')
        user_id = self.request.query_params.get('user')
        if contest_id:
            queryset = queryset.filter(contest_id=contest_id)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        return queryset

    def perform_create(self, serializer):
        instance = serializer.save()
        # Trigger grading in background
        threading.Thread(target=grade_submission_task, args=(instance.submission_id,)).start()

class LeaderboardViewSet(viewsets.ModelViewSet):
    queryset = Leaderboard.objects.all()
    serializer_class = LeaderboardSerializer

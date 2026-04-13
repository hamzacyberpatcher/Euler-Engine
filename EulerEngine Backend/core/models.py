from django.db import models

class User(models.Model):
    class RoleChoices(models.TextChoices):
        ADMIN = 'Admin', 'Admin'
        PARTICIPANT = 'Participant', 'Participant'

    user_id = models.AutoField(primary_key=True, db_column='UserID')
    username = models.CharField(max_length=50, unique=True, db_column='Username')
    email = models.EmailField(max_length=100, unique=True, db_column='Email')
    password_hash = models.CharField(max_length=255, db_column='PasswordHash')
    role = models.CharField(max_length=20, choices=RoleChoices.choices, db_column='Role')
    created_at = models.DateTimeField(auto_now_add=True, db_column='CreatedAt')
    is_active = models.BooleanField(default=True, db_column='IsActive')

    class Meta:
        db_table = 'Users'

class Problem(models.Model):
    class CategoryChoices(models.TextChoices):
        ALGEBRA = 'Algebra', 'Algebra'
        CALCULUS = 'Calculus', 'Calculus'
        POLYNOMIALS = 'Polynomials', 'Polynomials'
        OTHER = 'Other', 'Other'

    problem_id = models.CharField(max_length=200, primary_key=True, db_column='ProblemID')
    title = models.CharField(max_length=200, db_column='Title')
    statement = models.TextField(db_column='Statement')
    category = models.CharField(max_length=50, choices=CategoryChoices.choices, db_column='Category')
    rating = models.IntegerField(db_column='Rating')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, db_column='CreatedBy')
    is_deleted = models.BooleanField(default=False, db_column='IsDeleted')
    created_at = models.DateTimeField(auto_now_add=True, db_column='CreatedAt')

    class Meta:
        db_table = 'Problems'

class Rubric(models.Model):
    rubric_id = models.AutoField(primary_key=True, db_column='RubricID')
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE, db_column='ProblemID')
    step_description = models.TextField(db_column='StepDescription')
    max_points = models.PositiveIntegerField(db_column='MaxPoints')

    class Meta:
        db_table = 'Rubrics'

class Contest(models.Model):
    contest_id = models.CharField(max_length=200, primary_key=True, db_column='ContestID')
    title = models.CharField(max_length=200, db_column='Title')
    start_time = models.DateTimeField(db_column='StartTime')
    end_time = models.DateTimeField(db_column='EndTime')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, db_column='CreatedBy')
    is_active = models.BooleanField(default=True, db_column='IsActive')

    class Meta:
        db_table = 'Contests'

class ContestProblem(models.Model):
    contest = models.ForeignKey(Contest, on_delete=models.CASCADE, db_column='ContestID')
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE, db_column='ProblemID')
    point_value = models.PositiveIntegerField(db_column='PointValue')

    class Meta:
        db_table = 'ContestProblems'
        unique_together = (('contest', 'problem'),)

class ContestRegistration(models.Model):
    registration_id = models.AutoField(primary_key=True, db_column='RegistrationID')
    contest = models.ForeignKey(Contest, on_delete=models.CASCADE, db_column='ContestID')
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='UserID')
    registered_at = models.DateTimeField(auto_now_add=True, db_column='RegisteredAt')

    class Meta:
        db_table = 'ContestRegistrations'
        unique_together = (('contest', 'user'),)

class Submission(models.Model):
    class GradingStatusChoices(models.TextChoices):
        PENDING = 'Pending', 'Pending'
        GRADED = 'Graded', 'Graded'

    submission_id = models.AutoField(primary_key=True, db_column='SubmissionID')
    contest = models.ForeignKey(Contest, on_delete=models.CASCADE, db_column='ContestID')
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE, db_column='ProblemID')
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='UserID')
    answer_text = models.TextField(db_column='AnswerText')
    submitted_at = models.DateTimeField(auto_now_add=True, db_column='SubmittedAt')
    score = models.IntegerField(null=True, blank=True, default=0, db_column='Score')
    grading_status = models.CharField(max_length=20, choices=GradingStatusChoices.choices, default=GradingStatusChoices.PENDING, db_column='GradingStatus')

    class Meta:
        db_table = 'Submissions'

class Leaderboard(models.Model):
    contest = models.ForeignKey(Contest, on_delete=models.CASCADE, db_column='ContestID')
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='UserID')
    total_score = models.IntegerField(default=0, db_column='TotalScore')
    rank = models.IntegerField(db_column='Rank')
    last_updated = models.DateTimeField(auto_now=True, db_column='LastUpdated')

    class Meta:
        db_table = 'Leaderboards'
        unique_together = (('contest', 'user'),)

from django.contrib import admin

from .models import User, Problem, Rubric, Contest, ContestProblem, ContestRegistration, Submission, Leaderboard

admin.site.register(User)
admin.site.register(Problem)
admin.site.register(Rubric)
admin.site.register(Contest)
admin.site.register(ContestProblem)
admin.site.register(ContestRegistration)
admin.site.register(Submission)
admin.site.register(Leaderboard)

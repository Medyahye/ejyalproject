from django.urls import path

from . import staff_views as v

urlpatterns = [
    path('overview/', v.OverviewView.as_view()),
    path('orders/', v.OrdersView.as_view()),
    path('orders/<str:reference>/<str:decision>/', v.OrderDecisionView.as_view()),
    path('teachers/', v.StaffTeachersView.as_view()),
    path('teachers/<uuid:pk>/', v.StaffTeacherDetailView.as_view()),
    path('courses/', v.StaffCoursesView.as_view()),
    path('courses/<uuid:pk>/', v.StaffCourseDetailView.as_view()),
    path('users/', v.StaffUsersView.as_view()),
    path('users/<uuid:pk>/', v.StaffUserDetailView.as_view()),
    path('tracks/', v.StaffTracksView.as_view()),
    path('tracks/<slug:slug>/', v.StaffTrackDetailView.as_view()),
    path('terms/<int:number>/', v.StaffTermDetailView.as_view()),
    path('settings/', v.StaffSettingsView.as_view()),
]

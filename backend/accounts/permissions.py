from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_student)


class IsTeacher(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_teacher)


class IsCourseOwnerOrReadOnly(BasePermission):
    """Only the teacher who owns a course may create/update/delete it."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        return bool(user and user.is_authenticated and (user.is_teacher or user.is_staff_member))

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_staff_member or obj.teacher_id == request.user.id


class IsStaffMember(BasePermission):
    """Admins and the director: access to everything."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_staff_member)


class IsDirector(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_director)

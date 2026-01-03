import pytest
from rest_framework.test import APIClient
from apps.users.tests.factories import UserFactory
from django.contrib.auth import get_user_model

User = get_user_model()

@pytest.mark.django_db
class TestEstudiantePagination:
    def setup_method(self):
        self.client = APIClient()
        self.user = UserFactory(role='DOCENTE', email='docente@test.com', password='password123')
        self.client.force_authenticate(user=self.user)

    def test_estudiante_pagination(self):
        # Create 15 students
        UserFactory.create_batch(15, role=User.Role.ESTUDIANTE)
        
        # Request first page
        response = self.client.get('/api/users/estudiantes/')
        
        assert response.status_code == 200
        data = response.json()
        
        # Check pagination structure
        assert 'count' in data
        assert 'next' in data
        assert 'previous' in data
        assert 'results' in data
        
        assert data['count'] == 15
        assert len(data['results']) == 10  # PAGE_SIZE is 10
        assert data['next'] is not None
        
        # Request second page
        response_page_2 = self.client.get(data['next'])
        assert response_page_2.status_code == 200
        data_page_2 = response_page_2.json()
        
        assert len(data_page_2['results']) == 5

    def test_estudiante_search_pagination(self):
        # Create students with specific names
        UserFactory.create_batch(5, first_name='UniqueName', role=User.Role.ESTUDIANTE)
        UserFactory.create_batch(10, first_name='OtherName', role=User.Role.ESTUDIANTE)
        
        # Search for UniqueName
        response = self.client.get('/api/users/estudiantes/?search=UniqueName')
        assert response.status_code == 200
        data = response.json()
        
        assert data['count'] == 5
        assert len(data['results']) == 5

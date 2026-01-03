import pytest
from rest_framework.test import APIClient
from apps.pacientes.tests.factories import PacienteFactory
from apps.users.tests.factories import UserFactory

@pytest.mark.django_db
class TestPacientePagination:
    def setup_method(self):
        self.client = APIClient()
        self.user = UserFactory(role='DOCENTE', email='docente@test.com', password='password123')
        self.client.force_authenticate(user=self.user)

    def test_paciente_pagination(self):
        # Create 15 patients
        # We need to batch_create or just loop to create them ensuring unique RUTs
        # Factory boy's Sequence should handle unique RUTs if configured correctly
        patients = PacienteFactory.create_batch(15)
        
        # Request first page
        response = self.client.get('/api/pacientes/')
        
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
        assert data['previous'] is None
        
        # Request second page
        response_page_2 = self.client.get(data['next'])
        assert response_page_2.status_code == 200
        data_page_2 = response_page_2.json()
        
        assert len(data_page_2['results']) == 5
        assert data_page_2['previous'] is not None
        assert data_page_2['next'] is None

    def test_paciente_search_pagination(self):
        # Create patients with specific names to test search + pagination
        PacienteFactory.create_batch(5, nombre='UniqueName')
        PacienteFactory.create_batch(10, nombre='OtherName')
        
        # Search for UniqueName
        response = self.client.get('/api/pacientes/?search=UniqueName')
        assert response.status_code == 200
        data = response.json()
        
        assert data['count'] == 5
        assert len(data['results']) == 5

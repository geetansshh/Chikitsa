"""
Custom pagination classes for the API.
"""

from rest_framework.pagination import PageNumberPagination, CursorPagination


class StandardResultsSetPagination(PageNumberPagination):
    """
    Standard pagination with configurable page size.
    """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100
    
    def get_paginated_response_schema(self, schema):
        return {
            'type': 'object',
            'properties': {
                'count': {
                    'type': 'integer',
                    'description': 'Total number of items',
                },
                'next': {
                    'type': 'string',
                    'nullable': True,
                    'description': 'URL to next page',
                },
                'previous': {
                    'type': 'string',
                    'nullable': True,
                    'description': 'URL to previous page',
                },
                'results': schema,
            },
        }


class LargeResultsSetPagination(PageNumberPagination):
    """
    Pagination for endpoints that may return large datasets.
    """
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 500


class CursorResultsSetPagination(CursorPagination):
    """
    Cursor-based pagination for real-time data like chat messages.
    More efficient for large datasets and prevents issues with new records.
    """
    page_size = 20
    ordering = '-created_at'
    cursor_query_param = 'cursor'

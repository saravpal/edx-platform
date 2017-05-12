"""Tests of commerce utilities."""
import ddt
from django.test import TestCase
from django.test.client import RequestFactory
from django.test.utils import override_settings
from mock import patch

from commerce.models import CommerceConfiguration
from commerce.utils import EcommerceService
from openedx.core.lib.log_utils import audit_log
from student.tests.factories import UserFactory


def update_commerce_config(enabled=False, checkout_page='/test_basket/'):
    """ Enable / Disable CommerceConfiguration model """
    CommerceConfiguration.objects.create(
        checkout_on_ecommerce_service=enabled,
        single_course_checkout_page=checkout_page,
    )


class AuditLogTests(TestCase):
    """Tests of the commerce audit logging helper."""
    @patch('openedx.core.lib.log_utils.log')
    def test_log_message(self, mock_log):
        """Verify that log messages are constructed correctly."""
        audit_log('foo', qux='quux', bar='baz')

        # Verify that the logged message contains comma-separated
        # key-value pairs ordered alphabetically by key.
        message = 'foo: bar="baz", qux="quux"'
        self.assertTrue(mock_log.info.called_with(message))


@ddt.ddt
class EcommerceServiceTests(TestCase):
    """Tests for the EcommerceService helper class."""

    def setUp(self):
        self.request_factory = RequestFactory()
        self.user = UserFactory.create()
        self.request = self.request_factory.get("foo")
        update_commerce_config(enabled=True)
        super(EcommerceServiceTests, self).setUp()

    def test_is_enabled(self):
        """Verify that is_enabled() returns True when ecomm checkout is enabled. """
        is_enabled = EcommerceService().is_enabled(self.user)
        self.assertTrue(is_enabled)

        config = CommerceConfiguration.current()
        config.checkout_on_ecommerce_service = False
        config.save()
        is_not_enabled = EcommerceService().is_enabled(self.user)
        self.assertFalse(is_not_enabled)

    @patch('openedx.core.djangoapps.theming.helpers.is_request_in_themed_site')
    def test_is_enabled_for_microsites(self, is_microsite):
        """Verify that is_enabled() returns True if used for a microsite."""
        is_microsite.return_value = True
        is_enabled = EcommerceService().is_enabled(self.user)
        self.assertTrue(is_enabled)

    @override_settings(ECOMMERCE_PUBLIC_URL_ROOT='http://ecommerce_url')
    def test_ecommerce_url_root(self):
        """Verify that the proper root URL is returned."""
        self.assertEqual(EcommerceService().ecommerce_url_root, 'http://ecommerce_url')

    @override_settings(ECOMMERCE_PUBLIC_URL_ROOT='http://ecommerce_url')
    def test_get_absolute_ecommerce_url(self):
        """Verify that the proper URL is returned."""
        url = EcommerceService().get_absolute_ecommerce_url('/test_basket/')
        self.assertEqual(url, 'http://ecommerce_url/test_basket/')

    @override_settings(ECOMMERCE_PUBLIC_URL_ROOT='http://ecommerce_url')
    def test_get_receipt_page_url(self):
        """Verify that the proper Receipt page URL is returned."""
        order_number = 'ORDER1'
        url = EcommerceService().get_receipt_page_url(order_number)
        expected_url = 'http://ecommerce_url/checkout/receipt/?order_number={}'.format(order_number)
        self.assertEqual(url, expected_url)

    @override_settings(ECOMMERCE_PUBLIC_URL_ROOT='http://ecommerce_url')
    @ddt.data(
        (['TESTSKU'], 'http://ecommerce_url/test_basket/?sku=TESTSKU'),
        (['TESTSKU1', 'TESTSKU2', 'TESTSKU3'], 'http://ecommerce_url/test_basket/?sku=TESTSKU1&sku=TESTSKU2&sku=TESTSKU3')
    )
    @ddt.unpack
    def test_checkout_page_url(self, skus, expected_url):
        """ Verify the checkout page URL is properly constructed and returned. """
        url = EcommerceService().checkout_page_url(skus)
        self.assertEqual(url, expected_url)

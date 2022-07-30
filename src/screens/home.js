import React, {useEffect, useState} from 'react';
import {connect} from 'react-redux';
import {DrawerActions} from '@react-navigation/native';

import {ScrollView, View, Dimensions, Linking} from 'react-native';

import {ThemedView, Header} from 'src/components';
import {IconHeader, Logo, CartIcon} from 'src/containers/HeaderComponent';
import ModalHomePopup from 'src/containers/ModalHomePopup';

import {fetchCategories} from 'src/modules/category/actions';
import {categorySelector} from 'src/modules/category/selectors';
import {fetchSettingSuccess} from 'src/modules/common/actions';
import {
  dataConfigSelector,
  toggleSidebarSelector,
  expireConfigSelector,
} from 'src/modules/common/selectors';

import {fetchSetting} from 'src/modules/common/service';
import {mainStack} from 'src/config/navigator';
import SplashScreen from 'react-native-splash-screen';

// Containers
import Slideshow from './home/containers/Slideshow';
import CategoryList from './home/containers/CategoryList';
import ProductList from './home/containers/ProductList';
import ProductCategory from './home/containers/ProductCategory';
import Banners from './home/containers/Banners';
import TextInfo from './home/containers/TextInfo';
import CountDown from './home/containers/CountDown';
import BlogList from './home/containers/BlogList';
import Testimonials from './home/containers/Testimonials';
import Button from './home/containers/Button';
import Vendors from './home/containers/Vendors';
import Search from './home/containers/Search';
import Divider from './home/containers/Divider';
import {getSingleProduct} from '../../src/modules/product/service';

const {width} = Dimensions.get('window');

const containers = {
  slideshow: Slideshow,
  categories: CategoryList,
  products: ProductList,
  productcategory: ProductCategory,
  banners: Banners,
  text: TextInfo,
  countdown: CountDown,
  blogs: BlogList,
  testimonials: Testimonials,
  button: Button,
  vendors: Vendors,
  search: Search,
  divider: Divider,
};

const widthComponent = spacing => {
  if (!spacing) {
    return width;
  }
  const marginLeft =
    spacing.marginLeft && parseInt(spacing.marginLeft, 10)
      ? parseInt(spacing.marginLeft, 10)
      : 0;
  const marginRight =
    spacing.marginRight && parseInt(spacing.marginRight, 10)
      ? parseInt(spacing.marginRight, 10)
      : 0;
  const paddingLeft =
    spacing.paddingLeft && parseInt(spacing.paddingLeft, 10)
      ? parseInt(spacing.paddingLeft, 10)
      : 0;
  const paddingRight =
    spacing.paddingRight && parseInt(spacing.paddingRight, 10)
      ? parseInt(spacing.paddingRight, 10)
      : 0;
  return width - marginLeft - marginRight - paddingLeft - paddingRight;
};

const HomeScreen = props => {
  const [product, setProduct] = useState(undefined);
  const {dispatch} = props;
  const {config, toggleSidebar, navigation} = props;

  useEffect(() => {
    getConfig();
    dispatch(fetchCategories());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (product) {
      SplashScreen.hide();
      props.navigation.navigate(mainStack.product, {product: product});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  useEffect(() => {
    Linking.getInitialURL()
      .then(ev => {
        if (ev) {
          SplashScreen.show();
          var productSlug = '';
          if (ev.split(':')[0] === 'onedollardeal') {
            productSlug = ev.split('onedollardeal://');
          } else {
            productSlug = ev.split('https://onedollardeal.pk/');
          }
          const url = `https://onedollardeal.pk/wp-json/wc/v3/post_id_by_url?url=https://onedollardeal.pk/${productSlug}`;
          var myHeaders = new Headers();
          myHeaders.append(
            'Authorization',
            'Basic Y2tfOTVlOWY1MDMzNzdjODYxOTM4ZDNkOWY0NjEzZjdlMWY2MGYwOTI2Mzpjc19jOTA1YmJjZGU0OTdiZDBkM2RlYzI3Zjk5NzI3Y2E2ODU1NWNlOTIz',
          );
          myHeaders.append(
            'Cookie',
            'woocommerce_cart_hash=da5a195442541447d5d877ef31c05477; woocommerce_items_in_cart=1; woocommerce_recently_viewed=343',
          );

          var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow',
          };

          fetch(url, requestOptions)
            .then(response => response.text())
            .then(result => {
              handleOpenURL(343);
            })
            .catch(error => console.log('error', error));
        }
      })
      .catch(err => {
        console.warn('An error occurred', err);
      });

    const subscription = Linking.addEventListener('url', url => {
      SplashScreen.show();
      var productSlug = '';
      if (url) {
        if (url.split(':')[0] === 'onedollardeal') {
          productSlug = url.split('onedollardeal://');
        } else {
          productSlug = url.split('https://onedollardeal.pk/');
        }
        const urlGET = `https://onedollardeal.pk/wp-json/wc/v3/post_id_by_url?url=https://onedollardeal.pk/${productSlug}`;
        var myHeaders = new Headers();
        myHeaders.append(
          'Authorization',
          'Basic Y2tfOTVlOWY1MDMzNzdjODYxOTM4ZDNkOWY0NjEzZjdlMWY2MGYwOTI2Mzpjc19jOTA1YmJjZGU0OTdiZDBkM2RlYzI3Zjk5NzI3Y2E2ODU1NWNlOTIz',
        );
        myHeaders.append(
          'Cookie',
          'woocommerce_cart_hash=da5a195442541447d5d877ef31c05477; woocommerce_items_in_cart=1; woocommerce_recently_viewed=343',
        );

        var requestOptions = {
          method: 'GET',
          headers: myHeaders,
          redirect: 'follow',
        };

        fetch(urlGET, requestOptions)
          .then(response => response.text())
          .then(result => {
            handleOpenURL(343);
          })
          .catch(error => console.log('error', error));
      }
    });
    return () => {
      subscription.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenURL = async productId => {
    const productFetched = await getSingleProduct(
      productId,
      props.language ? props.language : 'en',
    );
    setProduct(productFetched);
  };

  const getConfig = async () => {
    try {
      // const {dispatch} = this.props;
      // Fetch setting
      let settings = await fetchSetting();
      const {configs, templates, ...rest} = settings;
      dispatch(
        fetchSettingSuccess({
          settings: rest,
          configs: configs,
          templates: templates,
        }),
      );
    } catch (e) {
      console.log('Error getConfig', e);
    }
  };

  const renderContainer = config => {
    const Container = containers[config.type];
    if (!Container) {
      return null;
    }
    return (
      <View key={config.id} style={config.spacing && config.spacing}>
        <Container
          {...config}
          widthComponent={widthComponent(config.spacing)}
        />
      </View>
    );
  };

  return (
    <ThemedView isFullView>
      <Header
        leftComponent={
          toggleSidebar ? (
            <IconHeader
              name="align-left"
              size={22}
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            />
          ) : null
        }
        centerComponent={<Logo />}
        rightComponent={<CartIcon />}
      />
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}>
        {config.map(data => renderContainer(data))}
      </ScrollView>
      <ModalHomePopup />
    </ThemedView>
  );
};

const mapStateToProps = state => {
  return {
    config: dataConfigSelector(state),
    toggleSidebar: toggleSidebarSelector(state),
    expireConfig: expireConfigSelector(state),
    expireCategory: categorySelector(state).expire,
  };
};

export default connect(mapStateToProps)(HomeScreen);

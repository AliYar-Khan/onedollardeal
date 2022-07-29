/**
 *
 * Main app
 *
 * App Name:          One Dollar Deal
 * Author:            Rnlab.io
 *
 * @since             1.0.0
 *
 * @format
 * @flow
 */

import React, {Component, useEffect} from 'react';
import {LogBox, Linking} from 'react-native';
import OneSignal from 'react-native-onesignal';
import {NavigationContainer} from '@react-navigation/native';

import {APP_ID} from './config/onesignal';
import './config-i18n';

import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';

import {SafeAreaProvider} from 'react-native-safe-area-context';
import AppRouter from './AppRouter';

import NavigationService from 'src/utils/navigation';

import configureStore from './config-store';
import {getDemoSelector} from './modules/common/selectors';
import {tokenSelector} from './modules/auth/selectors';
import demoConfig from './utils/demo';
import globalConfig from './utils/global';

const {store, persistor} = configureStore();

/**
 *
 * The new version, of react-native-gesture-handler send warning because package/library use it.
 *
 * https://stackoverflow.com/questions/70743721/remove-warning-react-native-gesture-handler-seems-like-youre-using-an-old-a/70768104
 */
LogBox.ignoreLogs([
  "[react-native-gesture-handler] Seems like you're using an old API with gesture components, check out new Gestures system!",
]);

class App extends Component {
  componentDidMount() {
    // O N E S I G N A L   S E T U P
    OneSignal.setLogLevel(6, 0);
    OneSignal.setAppId(APP_ID);

    /* O N E S I G N A L  H A N D L E R S */
    OneSignal.setNotificationWillShowInForegroundHandler(notifReceivedEvent => {
      console.log(
        'OneSignal: notification will show in foreground:',
        notifReceivedEvent,
      );
    });
    OneSignal.setNotificationOpenedHandler(notification => {
      console.log('OneSignal: notification opened:', notification);
    });
    OneSignal.setInAppMessageClickHandler(event => {
      console.log('OneSignal IAM clicked:', event);
    });
    OneSignal.addEmailSubscriptionObserver(event => {
      console.log('OneSignal: email subscription changed: ', event);
    });
    OneSignal.addSubscriptionObserver(event => {
      console.log('OneSignal: subscription changed:', event);
    });
    OneSignal.addPermissionObserver(event => {
      console.log('OneSignal: permission changed:', event);
    });

    store.subscribe(() => {
      const state = store.getState();
      demoConfig.setData(getDemoSelector(state).toJS());
      globalConfig.setToken(tokenSelector(state));
    });
  }

  componentWillUnmount() {
    OneSignal.clearHandlers();
  }

  render() {
    return (
      <NavigationContainer
        ref={navigationRef =>
          NavigationService.setTopLevelNavigator(navigationRef)
        }>
        <SafeAreaProvider>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <AppRouter />
            </PersistGate>
          </Provider>
        </SafeAreaProvider>
      </NavigationContainer>
    );
  }
}

export default App;

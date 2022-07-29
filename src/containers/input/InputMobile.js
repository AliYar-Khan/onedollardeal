import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View, FlatList} from 'react-native';
import PhoneInput from 'react-native-phone-input';
import {Modal, ListItem, Image, withTheme, SearchBar} from 'src/components';
import ViewLabel, {MIN_HEIGHT} from '../ViewLabel';

import {padding} from 'src/components/config/spacing';

const InputMobile = props => {
  const {
    label,
    value,
    error,
    style,
    textStyle,
    flagStyle,
    textProps,
    theme,
    onChangePhoneNumber,
    ...rest
  } = props;

  const {t} = useTranslation();

  const [isModal, setModal] = useState(false);
  const [pickerData, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [phone, setPhone] = useState();

  React.useEffect(() => {
    setData(phone?.getPickerData() ?? []);
    setPlaceholder(`+${phone?.getCountryCode() ?? ''}`);
  }, [phone]);

  const onPressFlag = () => {
    setModal(true);
  };

  const changeCountry = async country => {
    await phone.selectCountry(country.iso2);
    await setModal(false);
    await setPlaceholder(country.dialCode);
    if (typeof value === 'string') {
      changePhone(value);
    }
  };

  const changePhone = newValue => {
    const code = phone.getCountryCode();
    const valuePlaceholder = `+${code}`;
    if (valuePlaceholder !== placeholder) {
      setPlaceholder(valuePlaceholder);
    }
    if (onChangePhoneNumber) {
      onChangePhoneNumber({
        value: newValue,
        code: code ? `+${code}` : code,
        isoCode: phone.getISOCode(),
      });
    }
  };
  const updateSearch = data => {
    setSearch(data);
  };

  const dataCountry = pickerData.filter(
    country => country.label.toLowerCase().indexOf(search.toLowerCase()) >= 0,
  );

  return (
    <View style={styles.container}>
      <ViewLabel label={label} error={error} isHeading>
        <PhoneInput
          style={StyleSheet.flatten([styles.input, style && style])}
          textStyle={{
            color: theme.colors.primary,
          }}
          flagStyle={StyleSheet.flatten([styles.flag, flagStyle && flagStyle])}
          value={value}
          {...rest}
          textProps={{
            placeholder,
            placeholderTextColor: theme.ViewLabel.color,
            ...textProps,
          }}
          onChangePhoneNumber={changePhone}
          ref={ref => {
            setPhone(ref);
          }}
          onPressFlag={onPressFlag}
        />
      </ViewLabel>
      <Modal
        visible={isModal}
        setModalVisible={() => setModal(false)}
        ratioHeight={0.7}>
        <SearchBar
          cancelButton={false}
          placeholder={t('common:text_search_country_mobile')}
          onChangeText={updateSearch}
          value={search}
          platform="ios"
          onClear={() => setSearch('')}
          containerStyle={styles.search}
        />
        {dataCountry && dataCountry.length > 0 ? (
          <FlatList
            data={dataCountry}
            renderItem={({item}) => (
              <ListItem
                title={`(${item.dialCode})${item.label}`}
                onPress={() => changeCountry(item)}
                titleProps={{
                  colorSecondary: item.iso2 !== phone.getISOCode(),
                }}
                small
                type={'underline'}
                containerStyle={styles.item}
                leftElement={
                  <Image
                    source={item.image}
                    resizeMode="stretch"
                    style={styles.flag}
                  />
                }
                rightIcon={
                  item.iso2 === phone.getISOCode()
                    ? {name: 'check', size: 20}
                    : null
                }
              />
            )}
            initialNumToRender={15}
            keyExtractor={item => item.key.toString()}
          />
        ) : null}
      </Modal>
    </View>
  );
};

let styles = StyleSheet.create({
  input: {
    height: MIN_HEIGHT,
    paddingHorizontal: padding.large,
  },
  flag: {
    width: 30,
    height: 20,
    borderWidth: 0,
  },
  item: {
    paddingHorizontal: padding.large,
  },
  search: {
    paddingVertical: 0,
    paddingBottom: padding.small,
  },
});

InputMobile.defaultProps = {
  // initialCountry: 'sa',
  offset: padding.base,
};

export default withTheme(InputMobile);

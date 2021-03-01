import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import moment from 'moment';
import GoogleMapReact from 'google-map-react';
import { AuthContext } from '@ctb/auth-context';
import {
  FormControl,
  NativeSelect,
  InputLabel,
  Typography,
} from '@material-ui/core';
import * as geolib from 'geolib';
import SearchListItem from 'apps/client/components/SearchListItem';
import { useRouter } from 'next/router';
import { ThemeProvider } from '@material-ui/core/styles';
import { theme } from '@ctb/theme-provider';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import { SearchBoxComponent } from '@ctb/search-box-component';
import { CSSTransition } from 'react-transition-group';
import Marker from 'apps/client/components/Marker/Marker';
import Geocode from 'react-geocode';
import {
  Search,
  SearchList,
  SearchListTop,
  StyledTransitionGroup,
  Wrapper,
} from './styles/SearchStyles';
const SearchPid = () => {
  const { navigatorPosition, companies }: any = useContext(AuthContext);
  const router = useRouter();
  const isDesktop = useMediaQuery('(min-width:768px)');
  const [filter, setFilter] = React.useState<string>('');
  const [sortBy, setSortBy] = React.useState<string>('distance');
  const pid: any = router.query.slug && router.query.slug[0];
  const type: any = router.query.slug && router.query.slug[1];
  const [latitude, setLat] = useState(0);
  const [longitude, setLng] = useState(0);
  const [zoom, setZoom] = useState(0);

  useEffect(() => {
    getCoordinates();
  }, [pid, type]);
  const getCoordinates = async () => {
    let latitude = 0;
    let longitude = 0;
    let zoom = 0;

    if (pid && pid.length > 0 && type === 'location' && navigatorPosition) {
      if (pid === 'Check my position') {
        latitude = navigatorPosition.lat;
        longitude = navigatorPosition.lng;
        zoom = 12;
      } else {
        const response = await Geocode.fromAddress(`${pid}`);
        const { lat, lng } = response && response.results[0].geometry.location;
        latitude = lat;
        longitude = lng;
        zoom = 12;
      }
    } else {
      if (pid === 'Check my position') {
        const response = await Geocode.fromAddress(`Sweden`);
        const { lat, lng } = response && response.results[0].geometry.location;
        latitude = lat;
        longitude = lng;
        zoom = 12;
      } else {
        if (type === 'cafe') {
          const response = await Geocode.fromAddress(`Sweden`);
          const { lat, lng } =
            response && response.results[0].geometry.location;
          latitude = lat;
          longitude = lng;
          zoom = 5;
        } else {
          const response = await Geocode.fromAddress(`${pid}`);
          const { lat, lng } =
            response && response.results[0].geometry.location;
          latitude = lat;
          longitude = lng;
          zoom = 12;
        }
      }
    }
    setLat(latitude);
    setLng(longitude);
    setZoom(zoom);
  };
  const getOpeningHours = (day) => {
    const date = new Date();
    const getDay = date.getDay();
    const today = day[getDay];
    const { open, closed } = today;
    let isOpen = false;
    var format = 'hh:mm:ss';
    var time = moment();

    const beforeTime = moment(`${open}:00:00`, format);
    const afterTime = moment(`${closed}:00:00`, format);

    if (time.isBetween(beforeTime, afterTime)) {
      isOpen = true;
    } else {
      isOpen = false;
    }

    return isOpen ? today : null;
  };
  const getDistance = (item) => {
    return geolib.getDistance(
      {
        latitude: navigatorPosition.lat,
        longitude: navigatorPosition.lng,
      },
      {
        latitude: item.coordinates.lat,
        longitude: item.coordinates.lng,
      }
    );
  };
  let filteredData = null;
  if (type === 'location') {
    filteredData =
      companies &&
      companies.filter((item) => {
        const adress = `${item.adress.city} ${item.adress.name} ${item.adress.postalCode}`;

        return adress.toLowerCase().includes(pid.toLowerCase());
      });
  } else {
    filteredData =
      companies &&
      companies.filter((item) => {
        return item.companyName.toLowerCase().includes(pid.toLowerCase());
      });
  }
  if (filter) {
    filteredData =
      companies &&
      companies.filter((item) => {
        const pidItem = item.companyName
          .toLowerCase()
          .includes(pid.toLowerCase());
        if (filter === 'open') {
          return getOpeningHours(item.openingHours) && pidItem;
        } else if (filter === 'closed') {
          return !getOpeningHours(item.openingHours) && pidItem;
        } else {
          return pidItem;
        }
      });
  }
  if (sortBy) {
    filteredData.sort(function (a, b) {
      if (navigatorPosition && sortBy === 'distance') {
        return getDistance(a) - getDistance(b);
      } else if (sortBy === 'az' || sortBy === 'za') {
        let nameA;
        let nameB;
        if (sortBy === 'az') {
          nameA = a.companyName.toUpperCase();
          nameB = b.companyName.toUpperCase();
        } else {
          nameB = a.companyName.toUpperCase();
          nameA = b.companyName.toUpperCase();
        }

        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        return 0;
      }
    });
  }

  return (
    <ThemeProvider theme={theme}>
      {!isDesktop && <SearchBoxComponent isHeader={false} />}
      <Search>
        <SearchList>
          <SearchListTop>
            <FormControl>
              <InputLabel id="demo-simple-select">Filter</InputLabel>
              <NativeSelect
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                inputProps={{
                  name: 'age',
                  id: 'age-native-helper',
                }}
              >
                <option value={'all'}>All</option>
                <option value={'open'}>Open</option>
                <option value={'closed'}>Closed</option>
              </NativeSelect>
            </FormControl>
            <FormControl>
              <InputLabel id="demo-simple-select">Sort By:</InputLabel>
              <NativeSelect
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                inputProps={{
                  name: 'age',
                  id: 'age-native-helper',
                }}
              >
                <option value="distance">Distance</option>
                <option value="az">A-Z</option>
                <option value="za">Z-A</option>
              </NativeSelect>
            </FormControl>
            <Typography
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                margin: '0',
              }}
            >
              {filteredData.length} hits
            </Typography>
          </SearchListTop>
          <StyledTransitionGroup>
            {filteredData &&
              filteredData.map((item) => {
                return (
                  <CSSTransition key={item.id} timeout={500} classNames="item">
                    <SearchListItem
                      companyName={item.companyName}
                      vatNr={item.vatNr}
                      phoneNumber={item.phoneNumber}
                      email={item.email}
                      image={item.image}
                      openingHours={getOpeningHours(item.openingHours)}
                      adress={item.adress}
                      distance={navigatorPosition && getDistance(item)}
                      key={item.id}
                    />
                  </CSSTransition>
                );
              })}
          </StyledTransitionGroup>
        </SearchList>
        {zoom > 0 && (
          <Wrapper>
            <GoogleMapReact
              bootstrapURLKeys={{
                key: process.env.NEXT_PUBLIC_CLIENT_GOOGLE_MAPS_API_KEY,
              }}
              defaultZoom={13}
              zoom={zoom}
              center={[latitude, longitude]}
            >
              {filteredData.map((place) => {
                return (
                  <Marker
                    key={place.id}
                    companyName={place.companyName}
                    phoneNumber={place.phoneNumber}
                    adress={place.adress}
                    image={place.image}
                    openingHours={place.openingHours}
                    distance={navigatorPosition && getDistance(place)}
                    lat={place.coordinates.lat}
                    lng={place.coordinates.lng}
                  />
                );
              })}
            </GoogleMapReact>
          </Wrapper>
        )}
      </Search>
    </ThemeProvider>
  );
};

export default SearchPid;

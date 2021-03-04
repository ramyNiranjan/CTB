import { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '@ctb/firebase-auth';
import React from 'react';
import Geocode from 'react-geocode';
import { useRouter } from 'next/router';

import styled from 'styled-components';
import moment from 'moment';
import { AuthContext } from '@ctb/auth-context';
interface Props {
  children: any;
}
export const ClientContext = React.createContext({});
export const ClientContextProvider = (props: Props) => {
  const [companies, setCompanies] = useState<any>([]);
  const { setCurrentUser }: any = useContext(AuthContext);

  Geocode.setApiKey(process.env.NEXT_PUBLIC_CLIENT_GOOGLE_MAPS_API_KEY);

  const getCompanies = async () => {
    const res = await fetch('/mock/companies.json');
    const data = await res.json();
    data.map(async (item) => {
      //   const response = await Geocode.fromAddress(
      //     `${item.adress.name} ${item.adress.city} ${item.adress.postalCode}`
      //   );

      //   const { lat, lng } = response && response.results[0].geometry.location;
      let arr = [];
      item.tables.map((table) => {
        const startTime = moment(table.start, 'YYYY-MM-DD HH:mm:ss').toDate();
        const endTime = moment(table.end, 'YYYY-MM-DD HH:mm:ss').toDate();

        arr.push({
          title: table.title,
          allDay: table.allDay,
          start: startTime,
          end: endTime,
        });
      });

      const options = {
        id: item.id,
        companyName: item.companyName,
        vatNr: item.vatNr,
        phoneNumber: item.phoneNumber,
        email: item.email,
        image: item.image,
        coverImage: item.coverImage,
        tables: arr,
        openingHours: item.openingHours,
        adress: item.adress,
        coordinates: {
          lat: 59,
          lng: 18,
        },
      };
      setCompanies((prevState) => [...prevState, options]);
    });
  };
  const signInWithGoogle = () => {
    return auth
      .signInWithPopup(googleProvider)
      .then((res) => {
        setCurrentUser(res.user);
      })
      .catch((error) => {
        console.log(error.message);
      });
  };
  useEffect(() => {
    getCompanies();
  }, []);

  return (
    <ClientContext.Provider
      value={{
        signInWithGoogle,
        companies,
      }}
    >
      <FontWrapper>{props.children}</FontWrapper>
    </ClientContext.Provider>
  );
};
const FontWrapper = styled.div`
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;

  button {
    font-weight: bold;
  }
`;
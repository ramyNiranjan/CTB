import React, { useState } from 'react';
import MUIDataTable from 'mui-datatables';

import Layout from '../../components/layout/layout';

import { useFirestore } from '@ctb/use-firestore';
import CustomToolBarSelect from './CustomToolBarSelect';
import { firestore } from '@ctb/firebase-auth';

/* eslint-disable-next-line */
export interface UsersProps {}
// export interface option {}
const columns = [
  {
    name: 'companyName',
    label: 'Name',
    options: {
      filter: true,
      sort: true,
    },
  },
  {
    name: 'email',
    label: 'Email',
    options: {
      filter: true,
      sort: true,
    },
  },
  {
    name: 'uid',
    label: 'uid',
    options: {
      filter: true,
      sort: true,
      display: false,
    },
  },
];

export function PendingCompanies(props: UsersProps) {
  const { docs } = useFirestore('company_requests');
  console.log(docs);

  const setActivateCompanies = (selectedRows) => {
    selectedRows.data.map(async (item) => {
      const pendingCompany = docs[item.index];
      const { companyName, vatNr, email, phoneNumber, id } = pendingCompany;
      const companiesRef = firestore.collection('companies');
      const pendingCompanies = firestore.collection('company_requests').doc(id);
      await companiesRef.add({
        companyName,
        vatNr,
        email,
        phoneNumber,
      });
      await pendingCompanies.delete();
    });
  };

  const options = {
    filter: true,
    filterType: 'dropdown',
    response: 'simple',
    tableBodyHeight: '500px',
    elevation: 1,
    sortFilterList: true,
    customToolbarSelect: (selectedRows) => (
      <CustomToolBarSelect
        setActivateCompanies={setActivateCompanies}
        selectedRows={selectedRows}
      />
    ),
  };
  return (
    <Layout>
      <MUIDataTable
        title={'Pending Companies list'}
        data={docs}
        columns={columns}
        options={options}
      />
    </Layout>
  );
}

export default PendingCompanies;
import React from 'react';
import Topbar from '../../components/organisms/topbar';

// Define the functional component with TypeScript
const Home: React.FC = () => {
  return (
    <div>
      <Topbar/>
      {/* Defaults To Customized Search Results For Each User Depending on Title Search History etc */}
      {/* Defaults To Things Happening in The Company Like Google */}
      {/* <SearchResult> */}
    </div>
  );
};

export default Home;
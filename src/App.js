import React, { useState } from "react";
import axios from "axios";
import "./styles.css"; // Import the external styles.css file

function App() {
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [propertyInfo, setPropertyInfo] = useState(null);
  const [error, setError] = useState(null);
  const [houses, setHouses] = useState([]); // Array to store house objects
  const apiKey = "9d974a36f6daf505745477b88c20232a"; // Replace 'YOUR_API_KEY_HERE' with your actual API key
  const [searchTerm, setSearchTerm] = useState("");

  const handleChangeAddress1 = (event) => {
    setAddress1(event.target.value);
  };

  const handleChangeAddress2 = (event) => {
    setAddress2(event.target.value);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredHouses = houses.filter((house) => {
    const searchTermLowerCase = searchTerm.toLowerCase();
    const addressLowerCase = house.address.toLowerCase();
    const utilitiesLowerCase = JSON.stringify(house.utilities)
      .replace(/\"/g, "")
      .replace(/,/g, ", ")
      .toLowerCase();
    const parkingTypeLowerCase = house.prkgType
      ? house.prkgType.toLowerCase()
      : ""; // Check if prkgType is defined

    return (
      addressLowerCase.includes(searchTermLowerCase) ||
      utilitiesLowerCase.includes(searchTermLowerCase) ||
      parkingTypeLowerCase.includes(searchTermLowerCase)
    );
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.get(
        `https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/basicprofile?address1=${encodeURIComponent(
          address1
        )}&address2=${encodeURIComponent(address2)}`,
        {
          headers: {
            Accept: "application/json",
            apikey: apiKey,
          },
        }
      );
      setPropertyInfo(response.data.property[0]);
      setError(null);
    } catch (error) {
      setError("Error fetching property information. Please try again.");
      setPropertyInfo(null);
    }
  };

  const handleSaveProperty = () => {
    if (propertyInfo) {
      const {
        address,
        summary,
        sale,
        building: { rooms, parking },
        utilities,
      } = propertyInfo;

      // Format utilities into a string with spaces
      const formattedUtilities = Object.entries(utilities || {})
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");

      const newHouse = {
        address: address.oneLine,
        propType: summary.propType,
        yearBuilt: summary.yearBuilt,
        saleAmt: sale.saleAmountData.saleAmt,
        saleTransDate: sale.saleTransDate,
        prkgType: parking.prkgType,
        roomsTotal: rooms.roomsTotal,
        utilities: formattedUtilities, // Assign the formatted utilities string to utilities field
      };
      setHouses([...houses, newHouse]);
    }
  };

  return (
    <div className="container">
      <h1>Real Estate Information</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Address Line 1:
          <input type="text" value={address1} onChange={handleChangeAddress1} />
        </label>
        <br />
        <label>
          Address Line 2:
          <input type="text" value={address2} onChange={handleChangeAddress2} />
        </label>
        <br />
        <button type="submit">Search</button>
      </form>
      {error && <p className="error">{error}</p>}
      {propertyInfo && (
        <div className="property-info">
          <h2>Property Information</h2>
          <p>Address: {propertyInfo.address.oneLine}</p>
          <p>Property Type: {propertyInfo.summary.propType}</p>
          <p>Year Built: {propertyInfo.summary.yearBuilt}</p>
          <p>Sale Amount: ${propertyInfo.sale.saleAmountData.saleAmt}</p>
          <p>Previous Sale Date: {propertyInfo.sale.saleTransDate}</p>
          <p>Parking Type: {propertyInfo.building.parking.prkgType}</p>
          <p>Total Rooms: {propertyInfo.building.rooms.roomsTotal}</p>
          {/* Display utilities from propertyInfo */}
          <p>
            Utilities:{" "}
            {propertyInfo.utilities &&
              JSON.stringify(propertyInfo.utilities)
                .replace(/\"/g, "")
                .replace(/,/g, ", ")}
          </p>

          {/* Add the button only if there is no error */}
          {!error && (
            <button onClick={handleSaveProperty}>Add to Favorites</button>
          )}
        </div>
      )}
      {/* Display all saved houses */}
      {houses.length > 0 && (
        <div>
          <h2>Saved Houses</h2>
          <input
            type="text"
            placeholder="Search by address, utilities, or parking type"
            value={searchTerm}
            onChange={handleSearch}
          />
          {filteredHouses.map((house, index) => (
            <div key={index} className="property-info">
              <h3>{house.address}</h3>
              <p>Property Type: {house.propType}</p>
              <p>Year Built: {house.yearBuilt}</p>
              <p>Sale Amount: ${house.saleAmt}</p>
              <p>Previous Sale Date: {house.saleTransDate}</p>
              <p>Parking Type: {house.prkgType}</p>
              <p>Total Rooms: {house.roomsTotal}</p>
              {/* Display utilities from the house object */}
              <p>
                Utilities:{" "}
                {house.utilities &&
                  JSON.stringify(house.utilities)
                    .replace(/\"/g, "")
                    .replace(/,/g, ", ")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;

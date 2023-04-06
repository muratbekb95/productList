import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import Pagination from '@mui/material/Pagination';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import Product from './model/Product';
import { useNavigate } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import './App.scss';

enum SortingOption {
  byDefault = 1,
  byPrice,
  byRating
}

const loadPage = (navigate: any, page: number, searchOption: SortingOption, search: string) => {
  const path = `/?page=${page}&sortBy=${searchOption}&search=${search}`;
  try {
    navigate(path)
  } catch (e) {
    navigate("/error", { state: { message: `Failed to open page: ${page}` } });
  }
}

const search = (text: string, data: Array<Product>) => {
  return data.filter(dd => (dd.title.toLowerCase()).includes(text.toLowerCase()));
}

const App = () => {  
  const [allData, setAllData] = useState<Array<Product>>([]);
  const [searchData, setSearchData] = useState<Array<Product>>([]);
  const [filteredData, setFilteredData] = useState<Array<Product>>([]);
  const [dataAddedToCard, setDataAddedToCard] = useState<Array<Product>>([]);
  const navigate = useNavigate();
  const path = window.location.href;
  const pathOptions = path.split('/?/&');
  const [page, setPage] = useState((pathOptions.length >= 2 && pathOptions.length <= 4) ? parseInt(pathOptions[1].substring(4)) : 1);
  const [currentSearchOption, setCurrentSearchOption] = useState((pathOptions.length >= 3 && pathOptions.length <= 4) ? parseInt(pathOptions[2].substring(7)) : SortingOption.byDefault);
  const [currentSearchText, setCurrentSearchText] = useState(pathOptions.length === 4 ? pathOptions[3].substring(7) : '');
  const [size, setSize] = useState(1);
  const [sortingOption, setSortingOption] = useState('Default');

  const filterData = (fetchedData: Array<Product>, chosenSortingOption: SortingOption = currentSearchOption) => {
    const numberOfProducts = fetchedData.length
    let limited: Array<Product> = [];
    if (fetchedData.length > 0) {
      if (numberOfProducts < 10) {
        limited = chosenSortingOption === SortingOption.byPrice ? fetchedData.sort((product1, product2) => product1.price < product2.price ? 1 : -1) : SortingOption.byRating ? fetchedData.sort((product1, product2) => product1.rating < product2.rating ? 1 : -1) : fetchedData;
        setFilteredData(() => fetchedData);
        setSize(1);
      } else {
        limited = [];
        fetchedData = chosenSortingOption === SortingOption.byPrice ? fetchedData.sort((product1, product2) => product1.price < product2.price ? 1 : -1) : SortingOption.byRating ? fetchedData.sort((product1, product2) => product1.rating < product2.rating ? 1 : -1) : fetchedData;
        const numberOfProductsPerPage = 10;
        const addedToInit = ((page - 1) * numberOfProductsPerPage);
        let limit = addedToInit + numberOfProductsPerPage
        if (limit > numberOfProducts)
          limit = numberOfProducts;
        for (let i = addedToInit; i < limit; i++) {
          limited.push(fetchedData[i]);
        }
        setFilteredData(limited);
        setSize(Math.ceil(numberOfProducts / numberOfProductsPerPage));
      }
    }
    return limited;
  }

  const handleSortOptionChange = (event: any) => {
    //@ts-ignore
    const chosenSortingOption = event.target.value as string;
    setSortingOption(chosenSortingOption);
    switch (chosenSortingOption) {
      case 'Sort by price':
        setCurrentSearchOption(SortingOption.byPrice)
        break;
      case 'Sort by rating':
        setCurrentSearchOption(SortingOption.byRating)
        break;
      default:
        setCurrentSearchOption(SortingOption.byDefault)
        break;
    }
    setFilteredData(filterData(searchData.length === 0 ? allData : searchData, chosenSortingOption === 'Sort by price' ? SortingOption.byPrice : chosenSortingOption === 'Sort by rating' ? SortingOption.byRating : SortingOption.byDefault));
  };

  useEffect(() => {
    const run = async () => {
      const fetchedData = await fetch('https://my-json-server.typicode.com/muratbekb95/product_listing/products')
                                .then((response) => response.json())
                                .then((json) => json);
      setAllData(fetchedData);
      setFilteredData(filterData((currentSearchText !== '' ? (fetchedData as Array<Product>).filter(dd => dd.title.toLowerCase().includes(currentSearchText.toLowerCase())) : fetchedData), currentSearchOption));
    }
    run().catch(console.error);
  }, [page]);

  return (
    <div className="App">
      <Grid sx={{ flexGrow: 1, top: '50px', position: 'relative' }} container spacing={2}>
        <Grid item xs={12}>
          <Grid
            container
            direction="row"
            justifyContent="center"
          >
            <Paper
              component="form"
              sx={{ p: '2px 4px', margin: '0 100px', display: 'flex', alignItems: 'center', marginBottom: '30px', minWidth: '400px' }}
            >
              <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder="Search"
                inputProps={{ 'aria-label': 'search google maps' }}
                onChange={(e) => {
                  const text = e.target.value;
                  setCurrentSearchText(text);
                  if (text !== '') {
                    const searchResults = search(text, allData);
                    setSearchData(searchResults);
                    setFilteredData(filterData(searchResults, currentSearchOption));
                  } else {
                    setSearchData(allData);
                    setFilteredData(filterData(allData, currentSearchOption));
                  }
                  setPage(1);
                  loadPage(navigate, 1, currentSearchOption, text);
                }}
              />
              <IconButton type="button" sx={{ p: '10px' }} aria-label="search" onClick={() => {
                if (currentSearchText !== '') {
                  setSearchData(allData);
                  setFilteredData(filterData(search(currentSearchText, allData), currentSearchOption));
                  setPage(1);
                  loadPage(navigate, 1, currentSearchOption, currentSearchText);
                }
              }}>
                <SearchIcon />
              </IconButton>
            </Paper>
            <Box sx={{ minWidth: 120}}>
              <FormControl fullWidth>
                <InputLabel id="select-for-sort-option-label">Sort</InputLabel>
                <Select
                  labelId="select-for-sort-option-label"
                  id="select-for-sort-option"
                  value={sortingOption}
                  label={sortingOption}
                  onChange={handleSortOptionChange}
                >
                  <MenuItem value={'Default'}>Default</MenuItem>
                  <MenuItem value={'Sort by price'}>Sort by price</MenuItem>
                  <MenuItem value={'Sort by rating'}>Sort by rating</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ minWidth: 120, margin: '0 100px'}}>
              <Grid
                container
                direction="column"
                alignItems="flex-start"
              >
                <label>Total number of products: {dataAddedToCard.length}</label>
                <label>Total price: {dataAddedToCard.length === 0 ? 0 : dataAddedToCard.reduce((sum, product) => sum + product.price, 0)} KZT</label>
              </Grid>
            </Box>
          </Grid>
          <Grid container justifyContent="center" spacing={2}>
            {filteredData.map((value: Product) => (
              <Grid key={value.id} item>
                <Card
                  sx={{
                    height: 540,
                    width: 240,
                    backgroundColor: '#FDF0E0'
                  }}
                >
                  <CardHeader
                    title={value.title}
                  />
                  <CardMedia
                    component="img"
                    image={value.image}
                    alt="Product Image"
                    height={300}
                    // sx={{objectFit: 'contain'}}
                  />
                  <CardContent sx={{textAlign: 'left'}}>
                    <Typography variant="body2" color="text.secondary">
                      <span style={{overflow: 'auto'}}>
                        {/*@ts-ignore*/}
                        <b>Description:</b> {(value.description instanceof Array) ? (value.description.toString().substring(0, 100) + '...') : value.description.length > 100 ? value.description.substring(0, 100) + '...' : value.description}
                      </span>
                      <br/>
                      <b>Price:</b> {value.price} {value.currency}
                    </Typography>
                    <Rating
                      name="simple-controlled"
                      value={value.rating}
                      readOnly
                    />
                    <Button onClick={() => setDataAddedToCard(cardData => [...cardData, value])}>Add to card</Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Stack 
            sx={{ marginTop: 10, marginBottom: 10 }}
            alignItems={'center'}
            spacing={2}>
            <Pagination count={size} page={page} onChange={(e, p) => {
              setPage(p);
              loadPage(navigate, p, currentSearchOption, currentSearchText);
            }} variant="outlined" shape="rounded" />
          </Stack>
        </Grid>
      </Grid>
    </div>
  );
}

export default App;

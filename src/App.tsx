import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import Pagination from '@mui/material/Pagination';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState, useReducer } from 'react';
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

// every time a page changes this script runs
const loadPage = (navigate: any, page: number, searchOption: SortingOption, search: string) => {
  const path = `/?page=${page}&sortBy=${searchOption}&search=${search}`;
  try {
    navigate(path)
  } catch (e) {
    navigate("/error", { state: { message: `Failed to open page: ${page}` } });
  }
}

// search by title
const search = (text: string, data: Array<Product>) => {
  return data.filter(dd => (dd.title.toLowerCase()).includes(text.toLowerCase()));
}

// reducer function to changeSortOption when the sorting is set by Price, Rating or default
const changeSortOption = (sortState: {currentSortOption: SortingOption}, action: any) => {
  switch (action.type) {
    case 'Sort by price':
      return {
        currentSortOption: SortingOption.byPrice
      };
    case 'Sort by rating':
      return {
        currentSortOption: SortingOption.byRating
      };
    default:
      return {
        currentSortOption: SortingOption.byDefault
      };
  }
}

const App = () => {  
  const [allData, setAllData] = useState<Array<Product>>([]);
  const [searchData, setSearchData] = useState<Array<Product>>([]);
  const [filteredData, setFilteredData] = useState<Array<Product>>([]);
  const [dataAddedToCard, setDataAddedToCard] = useState<Array<Product>>([]);
  const navigate = useNavigate();
  // I used path as a main point to extract page number, current sort option and current search text
  const path = window.location.href;
  // I use split option to extract some data and add them into an array
  const pathOptions = path.split('/?/&');
  // here I extract page from path, ....?=page={this number I try to extract from path}
  const [page, setPage] = useState((pathOptions.length >= 2 && pathOptions.length <= 4) ? parseInt(pathOptions[1].substring(4)) : 1);
  // here I extract sort option from path
  const sortOptionByDefault = {currentSortOption: ((pathOptions.length >= 3 && pathOptions.length <= 4) ? (pathOptions[2].substring(7) as unknown as SortingOption) : SortingOption.byDefault)};
  const [sortState, dispatch] = useReducer(changeSortOption, sortOptionByDefault);
  const [currentSearchText, setCurrentSearchText] = useState(pathOptions.length === 4 ? pathOptions[3].substring(7) : '');
  const [size, setSize] = useState(1);
  const [sortingOption, setSortingOption] = useState('Default');

  const filterData = (fetchedData: Array<Product>, chosenSortingOption: SortingOption = sortState.currentSortOption) => {
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
    // call reducer dispatch by action name and change the sort option to the relative value
    dispatch({type: chosenSortingOption});
    setSortingOption(chosenSortingOption);
    setFilteredData(filterData(searchData.length === 0 ? allData : searchData, chosenSortingOption === 'Sort by price' ? SortingOption.byPrice : chosenSortingOption === 'Sort by rating' ? SortingOption.byRating : SortingOption.byDefault));
  };

  useEffect(() => {
    const run = async () => {
      const fetchedData = await fetch('https://my-json-server.typicode.com/muratbekb95/product_listing/products')
                                .then((response) => response.json())
                                .then((json) => json);
      setAllData(fetchedData);
      setFilteredData(filterData((currentSearchText !== '' ? (fetchedData as Array<Product>).filter(dd => dd.title.toLowerCase().includes(currentSearchText.toLowerCase())) : fetchedData), sortState.currentSortOption));
    }
    run().catch(console.error);
  }, [page]);

  return (
    <div className="App">
      <Grid className='container' sx={{
          flexGrow: 1, position: 'relative',
          '@media (min-width: 912px)' : {
            top: '50px'
          },
          '@media (min-width: 599px) and (max-width: 912px)' : {
            top: '30px'
          },
          '@media (min-width: 400px) and (max-width: 599px)' : {
            top: '20px'
          },
          '@media (max-width: 400px)' : {
            top: '20px'
          }
        }} container spacing={2}>
        <Grid item xs={12} className='sub-container'>
          <Grid
            container
            direction="row"
            justifyContent="center"
            className='top-bar'
          >
            <Paper
              component="form"
              sx={{
                p: '2px 4px', display: 'flex', alignItems: 'center',
                '@media (min-width: 1500px)' : {
                  margin: '0 100px',
                  minWidth: 400,
                  marginBottom: 10
                },
                '@media (min-width: 1199px) and (max-width: 1500px)' : {
                  margin: '0 100px',
                  minWidth: 400,
                  marginBottom: 5
                },
                '@media (min-width: 912px) and (max-width: 1199px)' : {
                  margin: '0 100px',
                  minWidth: 400,
                },
                '@media (min-width: 599px) and (max-width: 912px)' : {
                  margin: '0 50px',
                  minWidth: 350
                },
                '@media (min-width: 400px) and (max-width: 599px)' : {
                  margin: '0 20px',
                  minWidth: 100
                },
                '@media (max-width: 400px)' : {
                  minWidth: 300
                }
              }}
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
                    setFilteredData(filterData(searchResults, sortState.currentSortOption));
                  } else {
                    setSearchData(allData);
                    setFilteredData(filterData(allData, sortState.currentSortOption));
                  }
                  setPage(1);
                  loadPage(navigate, 1, sortState.currentSortOption, text);
                }}
              />
              <IconButton type="button" sx={{ p: '10px' }} aria-label="search" onClick={() => {
                if (currentSearchText !== '') {
                  setSearchData(allData);
                  setFilteredData(filterData(search(currentSearchText, allData), sortState.currentSortOption));
                  setPage(1);
                  loadPage(navigate, 1, sortState.currentSortOption, currentSearchText);
                }
              }}>
                <SearchIcon />
              </IconButton>
            </Paper>
            <Box sx={{ minWidth: 120,
              '@media (max-width: 400px)' : {
                margin: '20px 0'
              }
            }}>
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
            <Box sx={{ 
                '@media (min-width: 1500px)' : {
                  minWidth: 120, margin: '0 100px'
                },
                '@media (min-width: 912px) and (max-width: 1500px)' : {
                  minWidth: 120, margin: '20px 100px'
                },
                '@media (min-width: 599px) and (max-width: 912px)' : {
                  minWidth: 80, margin: '20px 60px'
                },
                '@media (min-width: 400px) and (max-width: 599px)' : {
                  minWidth: 80, margin: '20px 60px'
                },
                '@media (max-width: 400px)' : {
                  minWidth: 40, margin: '20px 100px', fontSize: '14px'
                }
            }}>
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
                  className='productContainer'
                  sx={{
                    height: 540,
                    width: 240,
                    '@media (min-width: 599px) and (max-width: 912px)' : {
                      height: 500,
                      width: 300,
                    },
                    '@media (min-width: 400px) and (max-width: 599px)' : {
                      height: 300,
                      width: 230,
                    },
                    '@media (max-width: 400px)' : {
                      height: 400,
                      width: 150,
                      overflow: 'scroll'
                    },
                    backgroundColor: '#FDF0E0'
                  }}
                >
                  <CardHeader
                    className='productTitle'
                    titleTypographyProps={{variant: 'h6'}}
                    title={value.title}
                  />
                  <CardMedia
                    component="img"
                    image={value.image}
                    alt="Product Image"
                    sx={{
                      '@media (min-width: 912px)' : {
                        height: 300
                      },
                      '@media (min-width: 599px) and (max-width: 912px)' : {
                        height: 250
                      },
                      '@media (min-width: 400px) and (max-width: 599px)' : {
                        height: 220
                      },
                      '@media (max-width: 400px)' : {
                        height: 150
                      }
                    }}
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
              // every time I change page this function runs
              loadPage(navigate, p, sortState.currentSortOption, currentSearchText);
            }} variant="outlined" shape="rounded" />
          </Stack>
        </Grid>
      </Grid>
    </div>
  );
}

export default App;


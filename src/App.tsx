import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import Pagination from '@mui/material/Pagination';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useState } from 'react';
import Product from './model/Product';
// import { withRouter } from 'react-router';
import { useNavigate } from 'react-router-dom';
import './App.css';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';

const loadPage = (navigate: any, page: number) => {
  const path = `/?page=${page}`;
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
  const [filteredData, setFilteredData] = useState<Array<Product>>([]);
  const navigate = useNavigate();
  const path = window.location.href;
  const currentPage = path.split('/?page=');
  const [page, setPage] = useState(currentPage.length === 2 ? parseInt(currentPage[1]) : 1);
  const [size, setSize] = useState(1);
  const [searchText, setSearchText] = useState('');

  const filterData = (fetchedData: Array<Product>) => {
    const numberOfProducts = fetchedData.length
    let limited = [];
    if (numberOfProducts < 2) {
      limited = fetchedData;
      setFilteredData(() => fetchedData);
    } else {
      limited = [];
      const numberOfProductsPerPage = 5;
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
    return limited;
  }

  useEffect(() => {
    const run = async () => {
      const fetchedData = await fetch('https://my-json-server.typicode.com/muratbekb95/product_listing/products')
                                .then((response) => response.json())
                                .then((json) => json);
      setAllData(fetchedData);
      setFilteredData(filterData(fetchedData));
    }
    run().catch(console.error);
  }, [page]);

  return (
    <div className="App">
      <Grid sx={{ flexGrow: 1, top: '50px', position: 'relative' }} container spacing={2}>
        <Grid item xs={12}>
          <Paper
            component="form"
            sx={{ p: '2px 4px', margin: '0 200px', display: 'flex', alignItems: 'center', marginBottom: '30px' }}
          >
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Search"
              inputProps={{ 'aria-label': 'search google maps' }}
              onChange={(e) => {
                const text = e.target.value;
                setSearchText(text);
                if (text !== '') {
                  setFilteredData(filterData(search(text, allData)));
                } else {
                  setFilteredData(filterData(allData));
                }
              }}
            />
            <IconButton type="button" sx={{ p: '10px' }} aria-label="search" onClick={() => searchText !== '' ? setFilteredData(filterData(search(searchText, allData))) : null}>
              <SearchIcon />
            </IconButton>
          </Paper>
          <Grid container justifyContent="center" spacing={2}>
            {filteredData.map((value: Product) => (
              <Grid key={value.id} item>
                <Card
                  sx={{
                    height: 540,
                    width: 240,
                    backgroundColor: '#bfd9e6'
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
                  />
                  <CardContent sx={{textAlign: 'left'}}>
                    <Typography variant="body2" color="text.secondary">
                      <span style={{overflow: 'auto'}}>
                        <b>Description:</b> {value.description.length > 100 ? (value.description.substring(0, 100) + '...') : value.description}
                      </span>
                      <br/>
                      <b>Price:</b> {value.price} {value.currency}
                    </Typography>
                    <Rating
                      name="simple-controlled"
                      value={value.rating}
                    />
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
              loadPage(navigate, p);
            }} variant="outlined" shape="rounded" />
          </Stack>
        </Grid>
      </Grid>
    </div>
  );
}

export default App;

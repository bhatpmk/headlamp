import {
  Link as RouterLink,
  Loader,
  SectionHeader,
} from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Divider,
  Link,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Autocomplete, Pagination } from '@mui/material';
import { useEffect, useState } from 'react';
//import { jsonToYAML, yamlToJSON } from '../../helpers';
import { fetchChartsFromArtifact } from '../../api/charts';
//import { createRelease } from '../../api/releases';
import { EditorDialog } from './EditorDialog';
import * as process from "process";

export const PAGE_OFFSET_COUNT_FOR_CHARTS = 9;

// TODO: Load this from environment and set default value as ARTIFACTHIB_IO
export const CHART_PROFILE = 'VANILLA_HELM_REPOSITORY'

// TODO: Again load this from environment, probably as part of the deployment of the chart
export const CHART_URL_PREFIX = 'http://localhost:80/';

export function ChartsList({ fetchCharts = fetchChartsFromArtifact }) {
  const helmChartCategoryList = [
    { title: 'All', value: 0 },
    { title: 'AI / Machine learning', value: 1 },
    { title: 'Database', value: 2 },
    { title: 'Integration and delivery', value: 3 },
    { title: 'Monitoring and logging', value: 4 },
    { title: 'Networking', value: 5 },
    { title: 'Security', value: 6 },
    { title: 'Storage', value: 7 },
    { title: 'Streaming and messaging', value: 8 },
  ];
  const [charts, setCharts] = useState<any[] | null>(null);
  const [openEditor, setEditorOpen] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [chartsTotalCount, setChartsTotalCount] = useState(0);
  const [chartCategory, setChartCategory] = useState(helmChartCategoryList[0]);
  const [search, setSearch] = useState('');
  const [selectedChartForInstall, setSelectedChartForInstall] = useState<any | null>(null);

  useEffect(() => {
    setCharts(null);
    fetchCharts(search, chartCategory, page).then(response => {
      if (CHART_PROFILE === 'VANILLA_HELM_REPOSITORY')  {
          setCharts(response.entries);
      } else {
          setCharts(response.packages);
      }
      const facets = response.facets;
      const categoryOptions = facets.find(
        (facet: {
          title: string;
          options: {
            name: string;
            total: number;
          }[];
        }) => facet.title === 'Category'
      ).options;
      if (chartCategory.title === 'All') {
        const totalCount = categoryOptions.reduce(
          (
            acc: number,
            option: {
              name: string;
              total: number;
            }
          ) => acc + option.total,
          0
        );
        setChartsTotalCount(totalCount);
        return;
      }
      const totalCount = categoryOptions.find(
        (option: { name: string; total: number }) => option.name === chartCategory?.title
      ).total;
      setChartsTotalCount(totalCount);
    });
  }, [page, chartCategory, search]);

  useEffect(() => {
    setPage(1);
  }, [chartCategory, search]);

  function Search() {
    return (
      <TextField
        style={{
          width: '20vw',
          margin: '0 1rem',
        }}
        id="outlined-basic"
        label="Search"
        value={search}
        // @todo: Find a better way to handle search autofocus
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        onChange={event => {
          setSearch(event.target.value);
        }}
      />
    );
  }

  function CategoryForCharts() {
    return (
      <Autocomplete
        style={{
          width: '20vw',
        }}
        options={helmChartCategoryList}
        getOptionLabel={option => option.title}
        defaultValue={helmChartCategoryList[0]}
        value={chartCategory}
        onChange={(event, newValue) => {
          // @ts-ignore
          setChartCategory(newValue);
        }}
        renderInput={params => {
          if (process.env.NODE_ENV === 'test') {
            // To keep the ids stable under test.
            params.id = params.id ? params.id.replace(/[0-9]/g, '') : params.id;
            params.inputProps.id = params.inputProps.id
              ? params.inputProps.id.replace(/[0-9]/g, '')
              : params.inputProps.id;
            params.InputLabelProps.id = params.InputLabelProps.id
              ? params.InputLabelProps.id.replace(/[0-9]/g, '')
              : params.InputLabelProps.id;
            // params.InputLabelProps.htmlFor = params.InputLabelProps.htmlFor
            //   ? params.InputLabelProps.htmlFor.replace(/[0-9]/g, '')
            //   : params.InputLabelProps.htmlFor;
          }
          return <TextField {...params} label="Categories" placeholder="Favorites" />;
        }}
      />
    );
  }

  if (CHART_PROFILE == 'VANILLA_HELM_REPOSITORY') {
      return (
          <>
              <EditorDialog
                  openEditor={openEditor}
                  chart={selectedChartForInstall}
                  handleEditor={(open: boolean) => setEditorOpen(open)}
              />
              <SectionHeader title="Applications" actions={[<Search />, <CategoryForCharts />]} />
              <Box display="flex" flexWrap="wrap" justifyContent="space-between" alignContent="start">
                  {!charts ? (
                      <Box
                          style={{
                              margin: '0 auto',
                          }}
                      >
                          <Loader title="" />
                      </Box>
                  ) : charts.length === 0 ? (
                      <Box mt={2} mx={2}>
                          <Typography variant="h5" component="h2">
                              {`No charts found for ${
                                  search ? `search term: ${search}` : `category: ${chartCategory.title}`
                              }`}
                          </Typography>
                      </Box>
                  ) : (
                      Object.keys(charts).map(chartName => {
                          return charts[chartName].map(chart => {
                              return (
                                  // TODO: There is some alignment problem where last row has an empty middle box
                                  <Box maxWidth="30%" width="400px" m={1}>
                                      <Card>
                                          <Box height="60px" display="flex" alignItems="center" marginTop="15px">
                                              {/* Do not display icon, when it is not specified */}
                                              <CardMedia
                                                  image={`${chart?.icon || ''}`}
                                                  style={{
                                                      width: '60px',
                                                      margin: '1rem',
                                                  }}
                                                  component="img"
                                              />
                                          </Box>
                                          <CardContent
                                              style={{
                                                  margin: '1rem 0rem',
                                                  height: '25vh',
                                                  overflow: 'hidden',
                                                  paddingTop: 0,
                                              }}
                                          >
                                              <Box
                                                  style={{
                                                      overflow: 'hidden',
                                                      textOverflow: 'ellipsis',
                                                      whiteSpace: 'nowrap',
                                                  }}
                                              >
                                                  <Tooltip title={chart.name}>
                                                      <Typography component="h5" variant="h5">
                                                          {chart.name}
                                                      </Typography>
                                                  </Tooltip>
                                              </Box>
                                              <Box display="flex" justifyContent="space-between" my={1}>
                                                  {/* TODO: If the chart.version contains v prefix, remove it */}
                                                  <Typography>v{chart.version}</Typography>
                                                  <Box
                                                      marginLeft={1}
                                                      style={{
                                                          overflow: 'hidden',
                                                          textOverflow: 'ellipsis',
                                                          whiteSpace: 'nowrap',
                                                      }}
                                                  >
                                                      {/* Repository name is not mandatory */}
                                                      <Tooltip title={chart?.repository?.name || ''}>
                                                          <span>{chart?.repository?.name || ''}</span>
                                                      </Tooltip>
                                                  </Box>
                                              </Box>
                                              <Divider />
                                              <Box mt={1}>
                                                  <Typography>
                                                      {chart?.description?.slice(0, 100)}
                                                      {chart?.description?.length > 100 && (
                                                          <Tooltip title={chart?.description}>
                                                              <span>…</span>
                                                          </Tooltip>
                                                      )}
                                                  </Typography>
                                              </Box>
                                          </CardContent>
                                          <CardActions
                                              style={{
                                                  justifyContent: 'space-between',
                                                  padding: '14px',
                                              }}
                                          >
                                              <Button
                                                  style={{
                                                      backgroundColor: '#000',
                                                      color: 'white',
                                                      textTransform: 'none',
                                                  }}
                                                  onClick={() => {
                                                      setSelectedChartForInstall(chart);
                                                      setEditorOpen(true);
                                                  }}
                                              >
                                                  Install
                                              </Button>
                                              {/* TODO: When there are multiple sources, the link includes comma separated values. For example, kube-prometheus-stack
                                                        Don't display the link when there is no source provided for a given component.
                                              */}
                                              <Link href={chart?.sources} target="_blank">
                                                  Learn More
                                              </Link>
                                          </CardActions>
                                      </Card>
                                  </Box>
                              );
                          });
                      })
                  )}
              </Box>
              {charts && charts.length !== 0 && (
                  <Box mt={2} mx="auto" maxWidth="max-content">
                      <Pagination
                          size="large"
                          shape="rounded"
                          page={page}
                          count={Math.floor(chartsTotalCount / PAGE_OFFSET_COUNT_FOR_CHARTS)}
                          color="primary"
                          onChange={(e, page: number) => {
                              setPage(page);
                          }}
                      />
                  </Box>
              )}
              <Box textAlign="right">
                  <Link href="https://docs.oracle.com/en/operating-systems/olcne/" target="_blank">
                      Powered by Oracle Cloud Native Environment
                  </Link>
              </Box>
          </>
      );
  } else {
      return (
          <>
              <EditorDialog
                  openEditor={openEditor}
                  chart={selectedChartForInstall}
                  handleEditor={(open: boolean) => setEditorOpen(open)}
              />
              <SectionHeader title="Applications" actions={[<Search />, <CategoryForCharts />]} />
              <Box display="flex" flexWrap="wrap" justifyContent="space-between" alignContent="start">
                  {!charts ? (
                      <Box
                          style={{
                              margin: '0 auto',
                          }}
                      >
                          <Loader title="" />
                      </Box>
                  ) : charts.length === 0 ? (
                      <Box mt={2} mx={2}>
                          <Typography variant="h5" component="h2">
                              {`No charts found for ${
                                  search ? `search term: ${search}` : `category: ${chartCategory.title}`
                              }`}
                          </Typography>
                      </Box>
                  ) : (
                      charts.map(chart => {
                          return (
                              <Box maxWidth="30%" width="400px" m={1}>
                                  <Card>
                                      <Box height="60px" display="flex" alignItems="center" marginTop="15px">
                                          <CardMedia
                                              image={`https://artifacthub.io/image/${chart.logo_image_id}`}
                                              style={{
                                                  width: '60px',
                                                  margin: '1rem',
                                              }}
                                              component="img"
                                          />
                                      </Box>
                                      <CardContent
                                          style={{
                                              margin: '1rem 0rem',
                                              height: '25vh',
                                              overflow: 'hidden',
                                              paddingTop: 0,
                                          }}
                                      >
                                          <Box
                                              style={{
                                                  overflow: 'hidden',
                                                  textOverflow: 'ellipsis',
                                                  whiteSpace: 'nowrap',
                                              }}
                                          >
                                              <Tooltip title={chart.name}>
                                                  <Typography component="h5" variant="h5">
                                                      <RouterLink
                                                          routeName="/helm/:repoName/charts/:chartName"
                                                          params={{
                                                              chartName: chart.name,
                                                              repoName: chart.repository.name,
                                                          }}
                                                      >
                                                          {chart.name}
                                                      </RouterLink>
                                                  </Typography>
                                              </Tooltip>
                                          </Box>
                                          <Box display="flex" justifyContent="space-between" my={1}>
                                              <Typography>v{chart.version}</Typography>
                                              <Box
                                                  marginLeft={1}
                                                  style={{
                                                      overflow: 'hidden',
                                                      textOverflow: 'ellipsis',
                                                      whiteSpace: 'nowrap',
                                                  }}
                                              >
                                                  <Tooltip title={chart?.repository?.name || ''}>
                                                      <span>{chart?.repository?.name || ''}</span>
                                                  </Tooltip>
                                              </Box>
                                          </Box>
                                          <Divider />
                                          <Box mt={1}>
                                              <Typography>
                                                  {chart?.description?.slice(0, 100)}
                                                  {chart?.description?.length > 100 && (
                                                      <Tooltip title={chart?.description}>
                                                          <span>…</span>
                                                      </Tooltip>
                                                  )}
                                              </Typography>
                                          </Box>
                                      </CardContent>
                                      <CardActions
                                          style={{
                                              justifyContent: 'space-between',
                                              padding: '14px',
                                          }}
                                      >
                                          <Button
                                              style={{
                                                  backgroundColor: '#000',
                                                  color: 'white',
                                                  textTransform: 'none',
                                              }}
                                              onClick={() => {
                                                  setSelectedChartForInstall(chart);
                                                  setEditorOpen(true);
                                              }}
                                          >
                                              Install
                                          </Button>
                                          <Link href={chart?.repository?.url} target="_blank">
                                              Learn More
                                          </Link>
                                      </CardActions>
                                  </Card>
                              </Box>
                          );
                      })
                  )}
              </Box>
              {charts && charts.length !== 0 && (
                  <Box mt={2} mx="auto" maxWidth="max-content">
                      <Pagination
                          size="large"
                          shape="rounded"
                          page={page}
                          count={Math.floor(chartsTotalCount / PAGE_OFFSET_COUNT_FOR_CHARTS)}
                          color="primary"
                          onChange={(e, page: number) => {
                              setPage(page);
                          }}
                      />
                  </Box>
              )}
              <Box textAlign="right">
                  <Link href="https://artifacthub.io/" target="_blank">
                      Powered by ArtifactHub
                  </Link>
              </Box>
          </>
      );
  }

}

import {
  CHART_PROFILE,
  CHART_URL_PREFIX,
  PAGE_OFFSET_COUNT_FOR_CHARTS,
  VANILLA_HELM_REPO
} from '../components/charts/List';

export function fetchChartsFromArtifact(
  search: string = '',
  category: { title: string; value: number },
  page: number,
  limit: number = PAGE_OFFSET_COUNT_FOR_CHARTS
) {
  if ( CHART_PROFILE === VANILLA_HELM_REPO) {
    // The code expects ${CHART_URL_PREFIX}/charts/ to return index.yaml containing the metadata of the available charts
    return fetch(
        `${CHART_URL_PREFIX}/charts/`
    ).then(response => response.json());
  }
  if (!category || category.value === 0) {
    return fetch(
        `https://artifacthub.io/api/v1/packages/search?kind=0&ts_query_web=${search}&sort=relevance&facets=true&limit=${limit}&offset=${
          (page - 1) * limit
        }`
    ).then(response => response.json());
  }
  return fetch(
      `https://artifacthub.io/api/v1/packages/search?kind=0&ts_query_web=${search}&category=${
        category.value
      }&sort=relevance&facets=true&limit=${limit}&offset=${(page - 1) * limit}`
  ).then(response => response.json());
}

export function fetchChartDetailFromArtifact(chartName: string, repoName: string) {
  if ( CHART_PROFILE === VANILLA_HELM_REPO) {
    return fetch(
        // The code expects ${CHART_URL_PREFIX}/versions/${chartName}.json to return available versions of a component as JSON array.
        // For example,here is the expected output for a given chart
        // Expected output -
        // {"available_versions":[{"version":"1.0.1"},{"version":"1.0.2"}]}
        `${CHART_URL_PREFIX}/versions/${chartName}.json`
    ).then(response => response.json());
  }
  return fetch(`http://localhost:4466/externalproxy`, {
    headers: {
      'Forward-To': `https://artifacthub.io/api/v1/packages/helm/${repoName}/${chartName}`,
    },
  }).then(response => response.json());
}

export function fetchChartValues(packageID: string, packageVersion: string) {
  if ( CHART_PROFILE === VANILLA_HELM_REPO) {
    // The code expects ${CHART_URL_PREFIX}/values/${packageID}/${packageVersion}/ to return values.yaml for the component
    // denoted by packageID and a given packageVersion. Please note that, chart.name is used for packageID in this case.
    return fetch(
        `${CHART_URL_PREFIX}/values/${packageID}/${packageVersion}/`
    ).then(response => response.text());
  }
  return fetch(`http://localhost:4466/externalproxy`, {
    headers: {
      'Forward-To': `https://artifacthub.io/api/v1/packages/${packageID}/${packageVersion}/values`,
    },
  }).then(response => response.text());
}

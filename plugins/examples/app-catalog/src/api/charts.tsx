import { PAGE_OFFSET_COUNT_FOR_CHARTS } from '../components/charts/List';

export function fetchChartsFromArtifact(
  search: string = '',
  category: { title: string; value: number },
  page: number,
  limit: number = PAGE_OFFSET_COUNT_FOR_CHARTS
) {
  // PABHAT: Just return the json output by accessing /charts/
  if (!category || category.value === 0) {
    return fetch(
      //`https://artifacthub.io/api/v1/packages/search?kind=0&ts_query_web=${search}&sort=relevance&facets=true&limit=${limit}&offset=${
      //  (page - 1) * limit
      //}`
      `http://0.0.0.0:80/charts/`
    ).then(response => response.json());
  }
  return fetch(
    //`https://artifacthub.io/api/v1/packages/search?kind=0&ts_query_web=${search}&category=${
    //  category.value
    //}&sort=relevance&facets=true&limit=${limit}&offset=${(page - 1) * limit}`
    `http://0.0.0.0:80/charts/`
  ).then(response => response.json());
}

// PABHAT: Handle this later
export function fetchChartDetailFromArtifact(chartName: string, repoName: string) {
  // This appears to be loading the README. For example, the response of https://artifacthub.io/api/v1/packages/helm/grafana/grafana
  // TODO: Fix this
  return fetch(`http://localhost:4466/externalproxy`, {
    headers: {
      'Forward-To': `https://artifacthub.io/api/v1/packages/helm/${repoName}/${chartName}`,
    },
  }).then(response => response.json());
}

export function fetchChartValues() {
  /*return fetch(`http://localhost:4466/externalproxy`, {
    headers: {
      'Forward-To': `https://artifacthub.io/api/v1/packages/${packageID}/${packageVersion}/values`,
    },
  }).then(response => response.text());*/
  // TODO: Fix this
  return fetch(
      `http://localhost:80/charts/grafana-6.11.0/values.yaml`
  ).then(response => response.text());

}

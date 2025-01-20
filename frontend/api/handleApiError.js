export default function handleError(error) {
  console.error(error);
  throw error.response ? error.response.data : new Error('Network error');
}

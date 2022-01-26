import { useLocation } from "react-router-dom";


export default function useQuery() {  // shortcut hook to get url params
  return new URLSearchParams(useLocation().search);
}
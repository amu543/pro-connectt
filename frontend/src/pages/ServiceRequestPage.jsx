import { useParams } from "react-router-dom";
export default function ServiceRequestPage() {
  const { service } = useParams();
  const providers = mockData[service] || [];
  return (
    <div className="p-8">
      
    </div>
  );
}

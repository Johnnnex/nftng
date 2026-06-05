import { ServerLoader } from "@/components/ServerLoader";
import { ConfirmDeliveryInitializer } from "./ConfirmDeliveryInitializer";
import ConfirmDelivery from "./ConfirmDelivery";

type Params = { params: Promise<{ token: string }> };

export default async function ConfirmDeliveryPage({ params }: Params) {
  const { token } = await params;
  return (
    <ServerLoader<[any]>
      requests={[{ url: `/api/confirm-delivery?token=${encodeURIComponent(token)}` }]}
      onSuccess={ConfirmDeliveryInitializer}
      notFoundOn404
    >
      <ConfirmDelivery token={token} />
    </ServerLoader>
  );
}

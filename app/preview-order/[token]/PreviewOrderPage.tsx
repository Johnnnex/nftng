import { ServerLoader } from "@/components/ServerLoader";
import { PreviewOrderInitializer } from "./PreviewOrderInitializer";
import PreviewOrder from "./PreviewOrder";

type Params = { params: Promise<{ token: string }> };

export default async function PreviewOrderPage({ params }: Params) {
  const { token } = await params;
  return (
    <ServerLoader<[any]>
      requests={[{ url: `/api/preview-order?token=${encodeURIComponent(token)}` }]}
      onSuccess={PreviewOrderInitializer}
      notFoundOn404
    >
      <PreviewOrder />
    </ServerLoader>
  );
}

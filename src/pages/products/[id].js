import ProductDetail from "@/components/ProductDetail";
import { fetchProductById } from "@/lib/products";

export default function ProductPage({ product }) {
  return <ProductDetail product={product} />;
}

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" };
}

export async function getStaticProps({ params }) {
  try {
    const product = await fetchProductById(params.id);

    if (!product) {
      return { notFound: true };
    }

    return {
      props: { product },
      revalidate: 60,
    };
  } catch {
    return { notFound: true };
  }
}

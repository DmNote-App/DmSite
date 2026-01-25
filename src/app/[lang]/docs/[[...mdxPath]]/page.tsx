import { generateStaticParamsFor, importPage } from "nextra/pages";
import type { FC } from "react";
import { useMDXComponents as getMDXComponents } from "../../../../../mdx-components";
import { notFound } from "next/navigation";

export const generateStaticParams = generateStaticParamsFor("mdxPath");

export async function generateMetadata(props: PageProps) {
  const params = await props.params;
  const mdxPath = params.mdxPath ?? [];
  try {
    const { metadata } = await importPage(mdxPath, params.lang);
    return metadata;
  } catch {
    return {};
  }
}

type PageProps = Readonly<{
  params: Promise<{
    mdxPath?: string[];
    lang: string;
  }>;
}>;

const Wrapper = getMDXComponents().wrapper;

const Page: FC<PageProps> = async (props) => {
  const params = await props.params;
  const mdxPath = params.mdxPath ?? [];
  const result = await importPage(mdxPath, params.lang).catch(() => notFound());

  const { default: MDXContent, toc, metadata, sourceCode } = result;
  return (
    <Wrapper toc={toc} metadata={metadata} sourceCode={sourceCode}>
      <MDXContent {...props} params={params} />
    </Wrapper>
  );
};

export default Page;

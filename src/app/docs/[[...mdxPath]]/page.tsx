import { redirect } from "next/navigation";

type PageProps = Readonly<{
  params: Promise<{
    mdxPath?: string[];
  }>;
}>;

export default async function DocsRedirectPage(props: PageProps) {
  const params = await props.params;
  const mdxPath = params.mdxPath ?? [];
  const suffix = mdxPath.length ? `/${mdxPath.join("/")}` : "";
  redirect(`/ko/docs${suffix}`);
}

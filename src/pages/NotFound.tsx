import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="app-page">
      <Header />

      <main id="main" className="app-container flex min-h-screen items-center justify-center pb-16 pt-28">
        <div className="surface w-full max-w-2xl p-8 text-center sm:p-12">
          <p className="eyebrow">404 · Unknown route</p>
          <h1 className="mt-6 font-heading text-4xl font-black tracking-[-0.035em] text-white sm:text-5xl">This verdict has no case.</h1>
          <p className="mx-auto mt-4 max-w-lg leading-7 text-slate-500">
            The route you requested does not exist in Ritual Clash.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild variant="wallet">
              <Link to="/">Back home</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/arena">Open protocol</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFound;

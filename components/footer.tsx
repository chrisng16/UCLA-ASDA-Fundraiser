import React from "react";

const Footer = () => {
  return (
    // <footer className="mt-8 text-center bg-background text-sm text-foreground w-full p-4 shadow-lg border-t border-muted-foreground/20">

    //   © {new Date().getFullYear()}{" "}
    //   <a href="https://nSquare.dev" target="_blank">
    //     nSquare.dev.
    //   </a>{" "}
    // </footer>
    <footer className="border-t py-6 w-full bg-background">
      <div className="container max-w-7xl mx-auto px-4 space-y-4">
        <div className="flex flex-col">
          <span className="text-2xl md:text-3xl text-center">
            UCLA ASDA Philanthropy
          </span>
          <span className="text-xl md:text-2xl text-center">
            Fundraiser Event
          </span>
        </div>
        <div className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()}{" "}
          <a href="https://nSquare.dev" target="_blank">
            nSquare.dev
          </a>{" "}
        </div>
      </div>
    </footer>
  );
};

export default Footer;

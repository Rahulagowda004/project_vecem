export const scrollToElement = (elementId: string) => {
  const element = document.getElementById(elementId);
  if (element) {
    // Adding options for better scrolling experience on mobile
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest",
    });
  }
};

// Add a new function to handle responsive scroll offset adjustment
export const scrollToElementWithOffset = (
  elementId: string,
  offset: number = 0
) => {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  }
};

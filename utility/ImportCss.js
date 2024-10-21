/**
 * Dynamically loads and applies CSS styles from a specified source.
 * The styles are either fetched from a provided URL or retrieved from localStorage if previously stored.
 * The function adds a <style> tag to the document head, importing all the styles.
 * 
 * @param {string} from - The URL or source from which to fetch the CSS styles in JSON format.
 * 
 * The JSON format should be:
 * {
 *   "key1": "url-to-css-file1.css",
 *   "key2": "url-to-css-file2.css",
 *   ...
 * }
 * 
 * If the styles are fetched for the first time, they are stored in localStorage under 'styleImp'.
 * The styles will be applied from localStorage on subsequent page loads if available.
 * 
 * Example usage:
 * ```
 * ImportAllCss('/path/to/css.json');
 * ```
 */
export default function ImportAllCss(from) {
    const setStyle = (css) => {
        let style = document.createElement('style');
        style.id = "styleImp";
        Object.keys(css).forEach((key) => {
            style.innerHTML += `@import url('${css[key]}');`;
        });
        document.head.appendChild(style);
    }

    const getStyle = () => {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', from, true);
        xhr.onload = function() {
            if (xhr.status === 200) {
                let css = JSON.parse(xhr.responseText);
                setStyle(css);
                localStorage.setItem('styleImp', JSON.stringify(css)); // Stocker les styles dans le localStorage
            }
        };
        xhr.send();
    }

    try {
        // Vérifier si les styles sont déjà dans le localStorage
        if (localStorage.getItem('styleImp')) {
            if (!document.querySelector('#styleImp')) {
                setStyle(JSON.parse(localStorage.getItem('styleImp')));
            }
        } else {
            getStyle();
        }
    } catch (error) {
        console.error(error);
    }
}

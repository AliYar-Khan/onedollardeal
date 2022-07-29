import {compose} from 'src/recompose/compose';
import withState from 'src/recompose/withState';
import lifecycle from 'src/recompose/lifecycle';
import {
  getSingleProduct,
  getSingleBlog,
  getSinglePage,
} from 'src/modules/product/service';

export const getSingleData = lifecycle({
  componentDidMount() {
    const {route, lang} = this.props;
    const id = route?.params?.id ?? '';
    const type = route?.params?.type ?? 'product';
    const {updateData, updateLoading} = this.props;
    if (id) {
      const fetchData =
        type === 'blog'
          ? getSingleBlog
          : type === 'page'
          ? getSinglePage
          : getSingleProduct;
      fetchData(id, lang)
        .then(data => {
          updateData(data);
        })
        .catch(error => {
          console.log(error, id);
        })
        .finally(() => {
          updateLoading(false);
        });
    } else {
      updateLoading(false);
    }
  },
});

export const defaultPropsData = compose(
  withState('loading', 'updateLoading', true),
  withState('data', 'updateData', {}),
);

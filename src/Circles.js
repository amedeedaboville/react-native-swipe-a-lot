
import React from 'react'
import PropTypes from 'prop-types'
import {　View,　PixelRatio,　TouchableWithoutFeedback　} from 'react-native'

const styles = {
  circleWrapper: {
    height: PixelRatio.getPixelSizeForLayoutSize(16),
    flexDirection:'row',
    flexWrap:'wrap',
    justifyContent: 'center',
  },
  circleDefault: {
    width: PixelRatio.getPixelSizeForLayoutSize(6),
    height: PixelRatio.getPixelSizeForLayoutSize(6),
    margin: 10,
    backgroundColor: 'rgb(158, 158, 158)',
    borderRadius: PixelRatio.getPixelSizeForLayoutSize(3)
  },
  circleActive: {
    backgroundColor: 'rgb(245, 245, 245)',
  }
}
class Circles extends React.Component {
  static get propTypes() {
    return {
      store: PropTypes.object,
      emitter: PropTypes.object,
      circleWrapperStyle: PropTypes.object,
      circleDefaultStyle: PropTypes.object,
      circleActiveStyle: PropTypes.object,
      children: PropTypes.any
    }
  }

  componentDidMount() {
    const { store } = this.props
    this.unsubscribe = store.subscribe(() =>
      this.forceUpdate()
    )
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  render() {
    const selectedPage = this.props.store.getState().page

    return (
      <View style={[styles.circleWrapper, this.props.circleWrapperStyle]} pointerEvents='box-none'>
        {React.Children.map(this.props.children, (c, i) => {
          return (
            <TouchableWithoutFeedback key={`circle${i}`} onPress={() => {
              this.props.emitter.emit('swipeToPage', {
                page: i
              })
            }}>
              <View>
                <View
                style={[styles.circleDefault,
                  this.props.circleDefaultStyle,
                  i === selectedPage && styles.circleActive,
                  i === selectedPage && this.props.circleActiveStyle]}>
                </View>
              </View>
            </TouchableWithoutFeedback>
          )
        })}
      </View>
    )
  }
}

export default Circles

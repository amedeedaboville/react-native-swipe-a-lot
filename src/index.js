import React from 'react'
import PropTypes from 'prop-types'
import ReactNative from 'react-native'
const {
  ScrollView,
  View
} = ReactNative

import Circles from './Circles'
import FixedSizeView from './FixedSizeView'
import reducer from './reducer'

import { createStore } from 'redux'

import { EventEmitter } from 'events'

export default class SwipeALot extends React.Component {
  constructor(props) {
    super(props)

    this.store = createStore(reducer)
    this.emitter = new EventEmitter()

    this.autoplayInterval = null
    this.autoplayPageCurrentlyBeingTransitionedTo = 0
  }

  getAutoplaySettings() {
    // This seems to be the recommended way to setup default props with nested objects
    // See https://github.com/facebook/react/issues/2568
    return Object.assign({
      enabled: false,
      disableOnSwipe: false,
      delayBetweenAutoSwipes: 5000
    }, this.props.autoplay)
  }

  componentDidMount() {

    this.store.dispatch({
      type: 'SET_ACTIVE_PAGE',
      page: 0
    })

    this.swipeToPageListener = ({ page }) => {
      this.store.dispatch({
        type: 'SET_ACTIVE_PAGE',
        page
      })

      const { width } = this.store.getState()
      this.swiper.scrollTo({
        x: page * width
      })

    }

    this.emitter.addListener('swipeToPage', this.swipeToPageListener)

    if (this.getAutoplaySettings().enabled) {
      this.startAutoplay()
    }
  }

  componentWillUnmount() {
    this.emitter.removeListener('swipeToPage', this.swipeToPageListener)
  }

  startAutoplay() {
    if (this.autoplayInterval) return

    this.autoplayInterval = setInterval(() => {
      let { page } = this.store.getState()
      const numOfPages = this.props.children.length || 1
      page++
      if (page >= numOfPages) page = 0
      this.swipeToPage(page)
      this.autoplayPageCurrentlyBeingTransitionedTo = page
    }, this.getAutoplaySettings().delayBetweenAutoSwipes)
  }

  stopAutoplay() {
    if (!this.autoplayInterval) return

    clearInterval(this.autoplayInterval)
  }

  getPage() {
    let { page } = this.store.getState()
    return page
  }

  swipeToPage(page) {
    this.emitter.emit('swipeToPage', { page })
  }

  static get defaultProps() {
    return {
        circlesBottom: true,
    }
  }
  static get propTypes() {
    return {
      wrapperStyle: PropTypes.object,
      circleWrapperStyle: PropTypes.object,
      circleDefaultStyle: PropTypes.object,
      circleActiveStyle: PropTypes.object,
      children: PropTypes.any,
      emitter: PropTypes.object,
      autoplay: PropTypes.object
    }
  }

  render() {
    const circles = (
      <Circles store={this.store} emitter={this.emitter}
        circleWrapperStyle={this.props.circleWrapperStyle}
        circleDefaultStyle={this.props.circleDefaultStyle}
        circleActiveStyle={this.props.circleActiveStyle}>
        {this.props.children}
      </Circles>
    )
    return (
      <View style={[this.props.wrapperStyle, {flex: 1}]} onLayout={() => {
          const page = this.getPage()
          this.swipeToPage(page)
        }}>
        {!this.props.circlesBottom && circles}
        {(() => {
          return (
            <ScrollView
              ref={(c) => this.swiper = c}
              pagingEnabled={true}
              horizontal={true}
              bounces={false}
              removeClippedSubviews={true}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              scrollEnabled={this.props.scrollEnabled !== false}
              onMomentumScrollEnd={(e) => {
                const { width } = this.store.getState()
                const page = Math.max(Math.min(e.nativeEvent.contentOffset.x / width, this.props.children.length), 0)
                this.store.dispatch({
                  type: 'SET_ACTIVE_PAGE',
                  page: page
                })
                if(this.props.onScrollEnd) {
                  this.props.onScrollEnd(page)
                }
                if (this.getAutoplaySettings().disableOnSwipe &&
                  this.autoplayPageCurrentlyBeingTransitionedTo !== page) {
                  this.stopAutoplay()
                }
              }}
              onLayout={(event) => {
                const {x, y, width, height} = event.nativeEvent.layout
                this.store.dispatch({
                  type: 'SET_DIMS',
                  width,
                  height
                })
              }}
              automaticallyAdjustContentInsets={false}>
              {React.Children.map(this.props.children, (c, i) => {
                return <FixedSizeView store={this.store} key={`swipealot-subview-${c.key}`}>{c}</FixedSizeView>
              })}
            </ScrollView>
          )
        })()}
        {this.props.circlesBottom && circles}
      </View>
    )
  }
}

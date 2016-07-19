#ifndef LIBOPENDKIM_H
#define LIBOPENDKIM_H

#include <nan.h>
#include <node_object_wrap.h>
#include <stdbool.h>
#include <opendkim/dkim.h>

namespace opendkim {

class OpenDKIM : public Nan::ObjectWrap {
  public:
    static NAN_MODULE_INIT(Init);

  private:
    explicit OpenDKIM();
    ~OpenDKIM();

    static NAN_METHOD(New);
    static NAN_METHOD(Pow);

    static inline Nan::Persistent<v8::Function> &constructor() {
      static Nan::Persistent<v8::Function> my_constructor;
      return my_constructor;
    }

    // private variables
    DKIM_LIB *state;
};

}

#endif
